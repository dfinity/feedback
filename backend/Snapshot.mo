import Types "Types";
import State "State";
import Trie "mo:base/Trie";
import Iter "mo:base/Iter";
import Int "mo:base/Int";

// maybe nest this module within State module (since it mirrors much of that structure)?
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
    public func team((i : TeamId, s : Types.Team.State)) : Entry {
      #team(i, s);
    };
    public func principalIsUser((p : Principal, u : UserId)) : Entry {
      #principalIsUser(p, u);
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

  // to do -- open PR for motoko-base.
  func iterAll<X>(iters : [Iter<X>]) : Iter<X> {
    var all = object { public func next() : ?X { null } };
    for (j in Iter.revRange(0, iters.size())) {
      let jj = Int.abs(j);
      all := iterAppend(iters[jj], all);
    };
    all;
  };

  public func getAll(s : State.State) : Chunk {
    // compiler says it cannot infer type args.
    let users = Iter.map<(UserId, Types.User.State), Entry>(
      Trie.iter(s.users.map),
      Cons.user,
    );

    // compiler says it cannot infer type args.
    let topics = Iter.map<(TopicId, Types.Topic.State), Entry>(
      Trie.iter(s.topics.map),
      Cons.topic,
    );

    // compiler says it cannot infer type args.
    let teams = Iter.map<(TeamId, Types.Team.State), Entry>(
      Trie.iter(s.teams.map),
      Cons.team,
    );

    // compiler says it cannot infer type args.
    let principalIsUser = Iter.map<(Principal, UserId), Entry>(
      Trie.iter(s.principals.map),
      Cons.principalIsUser,
    );

    let all = iterAll([users, topics, teams, principalIsUser]);
    Iter.toArray(all);
  };
};
