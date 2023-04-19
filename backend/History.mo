import Types "Types";

module {

    public type UserId = Types.User.Id;
    public type TopicId = Types.Topic.Id;

    public type Request = {
        #setUserIsModerator : {
            user : UserId;
            isMod : Bool
        };
        #createTopic : {
            edit : Types.Topic.Edit
        };
        #bulkCreateTopics : {
            edits : [Types.Topic.ImportEdit]
        };
        #clearTopics;
        #editTopic : {
            topic : TopicId;
            edit : Types.Topic.Edit;
        };
        #voteTopic : {
            topic : TopicId;
            userVote : Types.Topic.UserVote
        };
        #setTopicStatus : {
            topic : TopicId;
            status : Types.Topic.Status
        };
        #setTopicModStatus : {
            topic : TopicId;
            modStatus : Types.Topic.ModStatus
        };
        #login;
    };

    public type Internal = {
        #accessOk : AccessPredicate;
    };

    public type Response = {
        #ok;
        #err; // e.g., the user gives an invalid topic ID.
        #errAccess : AccessPredicate;
    };

    public type AccessPredicate = {
        #callerIsUser; // caller ID comes from outer Event type.
        #callerOwnsTopic : UserId;
        #callerIsModerator : UserId
    };

    public type Event = {
        #request : (Principal, Request);
        #internal : Internal;
        #response : Response;
    };

    ///
    /// OO interface for `Main` canister to log all of its state-affecting update behavior.
    /// Of particular interest are access control checks, and their outcomes.
    ///
    public class Log(/* to do -- accept stable log rep as init arg. */) {
        // request var is local state to
        // ensure logs are well-formed
        // (Request, followed by zero or more Internal events, ended by a Response).
        var request_ : ?Request = null;

        public func request(caller : Principal, r : Request) {
            assert request_ == null;
            request_ := ?r;

            // to do -- record it.
        };

        public func internal(i : Internal) {
            assert request_ != null;

            // to do -- record it.
        };

        public func ok() {
            assert request_ != null;
            request_ := null;

            // to do -- record it.
        };

        public func okIf(b : Bool) {
            assert request_ != null;
            request_ := null;

            // to do -- record either #ok or #err, depending.
        };

        public func okWithTopicId(i : Types.Topic.RawId) : Types.Topic.RawId {
            assert request_ != null;
            request_ := null;
            // to do -- record it.
            i
        };

        public func okWithUserId(i : Types.User.RawId) : Types.User.RawId {
            assert request_ != null;
            request_ := null;
            // to do -- record it.
            i
        };

        public func errAccess(a : AccessPredicate) {
            assert request_ != null;
            request_ := null;
            // to do -- record it.
        };


    }
}
