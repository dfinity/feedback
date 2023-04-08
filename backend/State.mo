import Types "Types";
import Trie "mo:base/Trie";

module {

    // Function from A to B, represented as a data structure.
    public type Map<A, B> = {
        var map: Trie.Trie<A, B>;
    };

    // Binary relation among A and B,
    // stored in way that permits efficiently collecting
    //  - all B related to an A.
    //  - all A related to a B.
    public type BinRel<A, B> = {
        var aB: Trie.Trie2D<A, B, ()>;
        var bA: Trie.Trie2D<B, A, ()>;
    };

    // Ternary relation among A, B, C,
    // stored in way that permits efficiently collecting
    //  - all (B, C) related to an A.
    //  - all (A, C) related to a B.
    public type TernRel<A, B, C> = {
        var aB: Trie.Trie2D<A, B, C>;
        var bA: Trie.Trie2D<B, A, C>;
    };

    public type UserId = Types.User.Id;
    public type TeamId = Types.Team.Id;
    public type TopicId = Types.Topic.Id;
    public type UserVote = Types.Topic.UserVote;

    // XXXState (for User-, Topic- and Team-).
    //
    // Maps that collectively give user-oriented, topic-oriented state
    // and team-oriented state state.
    //
    // This state lives outside of the cross-entity relations,
    // (Each state field comes from a single ID, and no other IDs).
    //
    // Question: Is it better to have separate maps for different
    // records, or to join the records into a single map target?
    // Still unclear.  Will revisit when there is more code.
    public type UserState = {
        info : Map<UserId, Types.User.Edit>;
        internal : Map<UserId, Types.User.Internal>;
    };

    public type TopicState = {
        info : Map<TopicId, Types.Topic.Edit>;
        status : Map<TopicId, Types.Topic.Status>;
        internal : Map<TopicId, Types.Topic.Internal>;
    };

    public type TeamState = {
        info : Map<TeamId, Types.Team.Edit>;
        internal : Map<TeamId, Types.Team.Internal>;
    };

    // Feedback board state representation.
    //
    // A record that can be versioned (wrapped in a big variant type,
    // starting at #v0), in a stable variable.
    public type State = {

        // Per-entity state:
        userState : UserState;
        topicState : TopicState;
        teamState : TeamState;

        principalState : PrincipalState;

        // user-team binary relation.
        userTeamRel : BinRel<UserId, TeamId>;

        // user-submitted-topic relation.
        userSubmittedTopic : BinRel<UserId, TopicId>;

        // user-owns-topic relation.
        userOwnsTopic : BinRel<UserId, TopicId>;

        // user-topic-userVote relation.
        userVoteRel : TernRel<UserId, TopicId, UserVote>;
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
    //Suppose we have a private method `getUserId` that maps a
    // principal to the corresponding userId, and creates it if none
    // exists.  All of the business logic that needs a userId will
    // either
    //
    //  (1) take userId as an arg *and* double-check the principal against it,
    //
    // or even more simply,
    //
    //  (2) *not* take userId as an arg, but instead get it from
    //  `getUserId`, internally.
    //
    public type PrincipalState = {
        userId : Map<Principal, UserId>;
    };

}
