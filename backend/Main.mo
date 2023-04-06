import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import List "mo:base/List";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Nat32 "mo:base/Nat32";

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
    id : Id;
    owner : ?User;
    createTime : Int; // milliseconds since Unix epoch
    upVoters : List.List<User>;
    downVoters : List.List<User>;
    status : Status;
  };

  type MetadataView = {
    id : Id;
    isOwner : Bool;
    createTime : Int; // milliseconds since Unix epoch
    upVoters : Nat;
    downVoters : Nat;
    yourVote : VoteStatus;
    status : Status;
  };

  type Topic = Info and Metadata;
  type TopicView = Info and MetadataView;
  type Id = Nat;

  let topics = TrieMap.TrieMap<Id, Topic>(Nat.equal, Nat32.fromIntWrap);
  stable var storedTopics : List.List<(Nat, Topic)> = null;
  stable var nextId : Id = 1;

  // List all feedback (TODO: pagination)
  public query ({ caller }) func fetch() : async [TopicView] {
    // TODO
    let user = #principal caller;
    // TODO: sort by creation time (eventually also number of upvotes)
    Iter.toArray(
      Iter.map(
        topics.vals(),
        func(t : Topic) : TopicView {
          let yourVote = if (List.some(t.upVoters, func(v : User) : Bool { v == user })) {
            #up;
          } else if (List.some(t.downVoters, func(v : User) : Bool { v == user })) {
            #down;
          } else #none;
          let isOwner = ?(#principal caller) == t.owner; // to do -- improve this check.
          {
            t with
            upVoters = List.size(t.upVoters);
            downVoters = List.size(t.downVoters);
            yourVote;
            isOwner;
          };
        },
      )
    );
  };

  // Post feedback
  public shared ({ caller }) func create(info : Info) : async Id {
    let id = nextId;
    nextId += 1;
    let metadata = {
      owner = ?(#principal caller);
      createTime = Time.now() / 1_000_000;
      upVoters = List.nil();
      downVoters = List.nil();
      status = #open;
    };
    topics.put(id, { info and metadata with id });
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
