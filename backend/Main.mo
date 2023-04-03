import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import List "mo:base/List";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Principal "mo:base/Principal";

actor class FeedbackBoard() {
  type User = { #principal : Principal; #auth0 : Text };
  type Status = { #open; #next; #completed; #closed };
  type VoteStatus = { #up; #down; #none };

  type Info = {
    title : Text;
    description : Text;
    links : [Text];
    tags : [Text];
  };

  type Metadata = {
    owner : ?User;
    createTime : Int;
    upVoters : List.List<User>;
    downVoters : List.List<User>;
    status : Status;
  };

  type Topic = Info and Metadata;
  type Id = Nat;

  let topics = TrieMap.TrieMap<Id, Topic>(Nat.equal, func n { Nat32.fromNat(n % (1 << 32 - 1)) });
  stable var storedTopics : List.List<(Nat, Topic)> = null;
  stable var nextId : Id = 1;

  // List all feedback (TODO: pagination)
  public shared ({ caller = owner }) func fetch() : async [Topic] {
    let entries = topics.entries();
    let sorted = Iter.sort(entries, func((a : Id, _ : Topic), (b : Id, _ : Topic)) { Nat.compare(a, b) });
    Iter.toArray(Iter.map(func(k : Id, v : Topic) { v }, sorted));
  };

  // Post feedback
  public shared ({ caller = owner }) func create(info : Info) : async Id {
    let id = nextId;
    nextId += 1;
    let metadata = {
      owner = ?(#principal owner);
      createTime = Time.now();
      upVoters = List.nil();
      downVoters = List.nil();
      status = #open;
    };
    topics.put(id, { info and metadata });
    return id;
  };

  public func edit(id : Id, info : Info) : async () {
    ignore do ? {
      let topic : Metadata = topics.get(id)!;
      topics.put(id, { info and topic });
    };
  };

  public shared ({ caller }) func vote(id : Id, status : VoteStatus) : async () {
    ignore do ? {
      let topic = topics.get(id)!;
      let user = #principal caller;
      func notCaller(voter : User) : Bool {
        switch voter {
          case (#principal p) not Principal.equal(p, caller);
          case _ true;
        };
      };
      var upVoters = List.filter(topic.upVoters, notCaller);
      var downVoters = List.filter(topic.downVoters, notCaller);

      switch (status) {
        case (#up) {
          upVoters := List.push(user, upVoters);
        };
        case (#down) {
          downVoters := List.push(user, downVoters);
        };
        case _ {};
      };
      topics.put(id, { topic with upVoters; downVoters });
    };
  };

  public func changeStatus(id : Id, status : Status) : async () {
    ignore do ? {
      let topic = topics.get(id)!;
      topics.put(id, { topic with status });
    };
  };

  // Pre-upgrade method
  system func preupgrade() : () {
    storedTopics := Iter.toList(topics.entries());
  };

  // Post-upgrade method
  system func postupgrade() : () {
    List.iterate(
      storedTopics,
      func(entry : (Id, Topic)) : () {
        let (id, topic) = entry;
        topics.put(id, topic);
      },
    );
  };
};
