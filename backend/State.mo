import Types "Types";
import Relate "Relate";

import Trie "mo:base/Trie";

module {
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

    // Per-entity state:
    users : UserState;
    topics : TopicState;
    teams : TeamState;

    principals : PrincipalState;

    // user-team-member binary relation.
    userTeamMember : BinRel<UserId, TeamId>;

    // user-submitted-topic relation.
    userSubmitsTopic : BinRel<UserId, TopicId>;

    // user-owns-topic relation.
    userOwnsTopic : BinRel<UserId, TopicId>;

    // user-topic-userVote relation.
    userTopicVotes : TernRel<UserId, TopicId, UserVote>;
  };

  public func init() : State {
    {
      users = Relate.Stable.emptyMap();
      topics = Relate.Stable.emptyMap();
      teams = Relate.Stable.emptyMap();
      principals = Relate.Stable.emptyMap();

      userTeamMember = Relate.Stable.emptyBinRel();
      userSubmitsTopic = Relate.Stable.emptyBinRel();
      userOwnsTopic = Relate.Stable.emptyBinRel();
      userTopicVotes = Relate.Stable.emptyTernRel();
    };
  };

  // principalState
  //
  // Associates at most a single user ID with a given principal.
  //
  // For access control logic:
  //   For each entry point:
  //     let callerId : Principal = ...(system-level arg to call)...
  //     let userId : ?UserId = ...(look up principal in principalState field)..
  //     does the userId match the target of the edit?
  //     If not, trap.
  //
  // Question: What entry point(s) will generate this user ID if
  // none exists?
  //
  // Suppose we have a private method `getUserId` that maps a
  // principal to the corresponding userId, and creates it if none
  // exists.  All of the business logic that needs a userId will
  // either:
  //
  //  (1) take userId as an arg
  //      *and*
  //      double-check the caller Principal against it,
  //
  // Or even more simply
  //
  //  (2) *not* take userId as an arg, but instead get it from
  //      `getUserId`, internally, based on the caller Principal.
  //
  public type PrincipalState = Map<Principal, UserId>;

};
