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
    #principalIsUser : (Principal, UserId);
    #userTeamMember : (UserId, TeamId);
    #userIsModerator : UserId;
    #userSubmitsTopic : (UserId, TopicId);
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
    public func userTeamMember((u : UserId, t : TeamId, ())) : Entry {
      #userTeamMember(u, t);
    };
    public func userIsModerator((u : UserId, ())) : Entry {
      #userIsModerator(u);
    };
    public func userSubmitsTopic((u : UserId, t : TopicId, ())) : Entry {
      #userSubmitsTopic(u, t);
    };
    public func userOwnsTopic((u : UserId, t : TopicId, ())) : Entry {
      #userOwnsTopic(u, t);
    };
    public func userTopicVote((u : UserId, t : TopicId, v : TopicUserVote)) : Entry {
      #userTopicVote(u, t, v);
    };

  };

  public type Chunk = [Entry];

  type Iter<X> = Iter.Iter<X>;

  // to do -- open PR for motoko-base.
  func iterTrie2D<X, Y, Z>(t : Trie.Trie2D<X, Y, Z>) : Iter<(X, Y, Z)> {
    // maybe there's a way to elimninate some type args, but they
    // seemed required at the time of authoring them.
    iterFlatten(
      Iter.map<(X, Trie.Trie<Y, Z>), Iter<(X, Y, Z)>>(
        Trie.iter<X, Trie.Trie<Y, Z>>(t),
        func(x : X, t2 : Trie.Trie<Y, Z>) : Iter<(X, Y, Z)> {
          Iter.map<(Y, Z), (X, Y, Z)>(
            Trie.iter<Y, Z>(t2),
            func(y : Y, z : Z) : (X, Y, Z) { (x, y, z) },
          );
        },
      )
    );
  };

  // to do -- open PR for motoko-base.
  func iterFlatten<X>(i : Iter<Iter<X>>) : Iter<X> {
    object {
      var inner = i.next();
      public func next() : ?X {
        switch inner {
          case null null;
          case (?j) {
            switch (j.next()) {
              case (?x) ?x;
              case null { inner := i.next(); next() };
            };
          };
        };
      };
    };
  };

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
    let users = Iter.map(
      Trie.iter(s.users.map),
      Cons.user,
    );

    let topics = Iter.map(
      Trie.iter(s.topics.map),
      Cons.topic,
    );

    let teams = Iter.map(
      Trie.iter(s.teams.map),
      Cons.team,
    );

    let principalIsUser = Iter.map(
      Trie.iter(s.principals.map),
      Cons.principalIsUser,
    );

    let userTeamMember = Iter.map(
      iterTrie2D(s.userTeamMember.aB),
      Cons.userTeamMember,
    );

    let userIsModerator = Iter.map(
      Trie.iter(s.userIsModerator.map),
      Cons.userIsModerator,
    );

    let userSubmitsTopic = Iter.map(
      iterTrie2D(s.userSubmitsTopic.aB),
      Cons.userSubmitsTopic,
    );

    let userOwnsTopic = Iter.map(
      iterTrie2D(s.userOwnsTopic.aB),
      Cons.userOwnsTopic,
    );

    let userTopicVote = Iter.map(
      iterTrie2D(s.userTopicVotes.aB),
      Cons.userTopicVote,
    );

    let all = iterAll([users, topics, teams, principalIsUser, userTeamMember, userIsModerator, userSubmitsTopic, userOwnsTopic, userTopicVote]);
    Iter.toArray(all);
  };
};
