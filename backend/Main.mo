import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import List "mo:base/List";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Principal "mo:base/Principal";

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
  upVoters : [User];
  downVoters : [User];
  status : Status;
};

type Topic = Info and Metadata;

actor {
  let topics : TrieMap.TrieMap<Nat, Topic> = TrieMap.TrieMap<Nat, Topic>(Nat.equal, Hash.hash);
  stable var storedTopics : List.List<(Nat, Topic)> = null;
  stable var nextId : Nat = 1;

  // Post feedback
  public shared ({ caller = owner }) func create(info : Info) : async () {
    let id = nextId;
    nextId += 1;
    let metadata = {
      owner = ?(#principal owner);
      createTime = Time.now();
      upVoters = [];
      downVoters = [];
      status = #open;
    };
    topics.put(id, { info and metadata });
    // FIXME return id
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
      var upVoters = Array.filter(topic.upVoters, notCaller);
      var downVoters = Array.filter(topic.downVoters, notCaller);

      switch (status) {
        case (#up) {
          upVoters := Array.append(upVoters, [user]);
        };
        case (#down) {
          downVoters := Array.append(downVoters, [user]);
        };
        case (#none) {

        };
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
