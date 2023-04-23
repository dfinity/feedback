import Types "Types";
import State "State";
import Trie "mo:base/Trie";
import Iter "mo:base/Iter";

// maybe nest this module within Relate module?
// OTOH, deep indentation is annoying.
module {
  type UserId = State.UserId;
  type TopicId = State.TopicId;
  type TeamId = State.TeamId;
  type TopicUserVote = Types.Topic.UserVote;

  public type Entry = {
    #user : (UserId, Types.User.State);
    #topic : (TopicId, Types.Topic.State);
    #team : (TeamId, Types.Team.State);
    #principalIsUser : (Principal, Types.User.Id);
    #userTeamMember : (UserId, Types.Team.Id);
    #userIsModerator : UserId;
    #userSubmitsTopic : (UserId, Types.Topic.Id);
    #userOwnsTopic : (UserId, TopicId);
    #userTopicVote : (UserId, TopicId, TopicUserVote);
  };

  /// Construct Entry values.
  module Cons {
    public func user((i : Types.User.Id, s : Types.User.State)) : Entry {
      #user(i, s);
    };
    public func topic((i : TopicId, s : Types.Topic.State)) : Entry {
      #topic(i, s);
    };
  };

  public type Chunk = [Entry];

  type Iter<X> = Iter.Iter<X>;

  // to do -- open PR for motoko-base.
  func iterAppend<X>(i1 : Iter<X>, i2 : Iter<X>) : Iter<X> {
    object {
      public func next() : ?X {
        switch (i1.next()) {
          case (?x) ?x;
          case null i2.next();
        };
      };
    };
  };

  public func getAll(s : State.State) : Chunk {
    let users = Iter.map<(UserId, Types.User.State), Entry>(
      Trie.iter(s.users.map),
      Cons.user,
    );

    let topics = Iter.map<(TopicId, Types.Topic.State), Entry>(
      Trie.iter(s.topics.map),
      Cons.topic,
    );

    let iterAll = iterAppend(users, topics);
    Iter.toArray(iterAll);
  };
};
