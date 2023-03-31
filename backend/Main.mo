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

  let topics : TrieMap.TrieMap<Nat, Topic> = TrieMap.TrieMap<Nat, Topic>(Nat.equal, Hash.hash);
  stable var storedTopics : List.List<(Nat, Topic)> = null;
  stable var nextId : Nat = 1;

  // Post feedback
  public shared ({ caller = owner }) func create(info : Info) : async Nat {
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

  public func edit(id : Nat, info : Info) : async () {
    ignore do ? {
      let topic : Metadata = topics.get(id)!;
      topics.put(id, { info and topic });
    };
  };

  public shared ({ caller }) func vote(id : Nat, status : VoteStatus) : async () {
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

  public func changeStatus(id : Nat, status : Status) : async () {
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
      func(entry : (Nat, Topic)) : () {
        let (id, topic) = entry;
        topics.put(id, topic);
      },
    );
  };
};
