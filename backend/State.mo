import Types "Types";
import Relate "Relate";

import Principal "mo:base/Principal";

module {
  type UnRel<A> = Relate.Stable.UnRel<A>;
  type Map<A, B> = Relate.Stable.Map<A, B>;
  type BinRel<A, B> = Relate.Stable.BinRel<A, B>;
  type TernRel<A, B, C> = Relate.Stable.TernRel<A, B, C>;

  // # User, Topic and Team-State.
  //
  // Maps that collectively give user-oriented, topic-oriented
  // and team-oriented state.
  //
  // This per-entity state lives outside of the cross-entity relations,
  // (Each state field comes from a single ID, and no other IDs).

  public type UserId = Types.User.Id;
  public type TeamId = Types.Team.Id;
  public type TopicId = Types.Topic.Id;
  public type UserVote = Types.Topic.UserVote;

  public type UserState = Map<UserId, Types.User.State>;

  public type TopicState = Map<TopicId, Types.Topic.State>;

  public type TeamState = Map<TeamId, Types.Team.State>;

  public type PrincipalState = Map<Principal, UserId>;

  // # Feedback board state representation.
  //
  // A record that can be versioned (wrapped in a big variant type,
  // starting at #v0), in a stable variable.
  //
  // Eventually, when stable regions are complete and we have a canonical
  // map representation for them, we can migrate into stable memory
  // representations of these maps, and avoid serialization/deserialization
  // steps on upgrade.
  public type State = {
    // # Per-entity state:
    users : UserState;
    var nextUserId : Types.Team.RawId;

    topics : TopicState;
    var nextTopicId : Types.Topic.RawId;

    teams : TeamState;
    var nextTeamId : Types.Team.RawId;

    principals : PrincipalState;

    // user-team-member binary relation.
    userTeamMember : BinRel<UserId, TeamId>;

    // user-is-moderator predicate.
    userIsModerator : UnRel<UserId>;

    // user-submitted-topic relation.
    userSubmitsTopic : BinRel<UserId, TopicId>;

    // user-owns-topic relation.
    userOwnsTopic : BinRel<UserId, TopicId>;

    // user-topic-userVote relation.
    userTopicVotes : TernRel<UserId, TopicId, UserVote>;
  };

  public func init(_installer : Principal) : State {
    {
      users = Relate.Stable.emptyMap();
      var nextUserId = 1;
      topics = Relate.Stable.emptyMap();
      var nextTopicId = 1;
      teams = Relate.Stable.emptyMap();
      var nextTeamId = 1;
      principals = Relate.Stable.emptyMap();

      userTeamMember = Relate.Stable.emptyBinRel();
      userIsModerator = Relate.Stable.emptyUnRel();
      userSubmitsTopic = Relate.Stable.emptyBinRel();
      userOwnsTopic = Relate.Stable.emptyBinRel();
      userTopicVotes = Relate.Stable.emptyTernRel();
    };
  };

  public type OOState = {
    users : Relate.OO.Map<UserId, Types.User.State>;
    nextUserId : () -> Nat;

    topics : Relate.OO.Map<TopicId, Types.Topic.State>;
    nextTopicId : () -> Nat;

    teams : Relate.OO.Map<TeamId, Types.Team.State>;

    principals : Relate.OO.Map<Principal, UserId>;

    userTeamMember : Relate.OO.BinRel<UserId, TeamId>;
    userIsModerator : Relate.OO.UnRel<UserId>;
    userSubmitsTopic : Relate.OO.BinRel<UserId, TopicId>;
    userOwnsTopic : Relate.OO.BinRel<UserId, TopicId>;
    userTopicVotes : Relate.OO.TernRel<UserId, TopicId, UserVote>;
  };

  public func OO(state : State) : OOState {

    // # OO Wrappers for entities.
    //
    // Arguments are relevant fields from state, and primary-key utility functions (hash, equal).

    let users = Relate.OO.Map(state.users, Types.User.idHash, Types.User.idEqual);
    let topics = Relate.OO.Map(state.topics, Types.Topic.idHash, Types.Topic.idEqual);
    let teams = Relate.OO.Map(state.teams, Types.Team.idHash, Types.Team.idEqual);
    let principals = Relate.OO.Map(state.principals, Principal.hash, Principal.equal);

    // # OO Wrappers for relations.
    //
    // Arguments are relevant fields from state, and primary-key utility functions (hash, equal).

    let userTeamMember = Relate.OO.BinRel(state.userTeamMember, (Types.User.idHash, Types.Team.idHash), (Types.User.idEqual, Types.Team.idEqual));
    let userIsModerator = Relate.OO.UnRel(state.userIsModerator, Types.User.idHash, Types.User.idEqual);
    let userSubmitsTopic = Relate.OO.BinRel(state.userSubmitsTopic, (Types.User.idHash, Types.Topic.idHash), (Types.User.idEqual, Types.Topic.idEqual));
    let userOwnsTopic = Relate.OO.BinRel(state.userOwnsTopic, (Types.User.idHash, Types.Topic.idHash), (Types.User.idEqual, Types.Topic.idEqual));
    let userTopicVotes = Relate.OO.TernRel(state.userTopicVotes, (Types.User.idHash, Types.Topic.idHash), (Types.User.idEqual, Types.Topic.idEqual));

    {
      users;
      topics;
      teams;
      principals;
      userTeamMember;
      userIsModerator;
      userSubmitsTopic;
      userOwnsTopic;
      userTopicVotes;
      nextUserId = func() : Nat {
        let i = state.nextUserId;
        state.nextUserId += 1;
        i;
      };
      nextTopicId = func() : Nat {
        let i = state.nextTopicId;
        state.nextTopicId += 1;
        i;
      };
    };
  };

};
