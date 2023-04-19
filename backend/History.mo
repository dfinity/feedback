import Types "Types";

module {

    public type UserId = Types.User.Id;
    public type TopicId = Types.Topic.Id;

    public type Request = {
        #setUserIsModerator : UserId;
        #createTopic : {
            user : ?UserId;
            importId : ?Types.Topic.ImportId;
            edit : Types.Topic.Edit
        };
        #bulkCreateTopics : {
            edits : [Types.Topic.Edit]
        };
        #clearTopics;
        #editTopic : {
            id : TopicId;
            edit : Types.Topic.Edit;
        };
        #voteTopic : {
            id : TopicId;
            userVote : Types.Topic.UserVote
        };
        #setTopicStatus : {
            id : TopicId;
            status : Types.Topic.Status
        };
        #setTopicModStatus : {
            id : TopicId;
            modStatus : Types.Topic.ModStatus
        };
        #login;
    };

    public type Internal = {
        #accessOk : AccessPredicate;
    };

    public type Response = {
        #ok;
        #errAccess : AccessPredicate;
    };

    public type AccessPredicate = {
        #callerIsUser : UserId;
        #callerIsModerator : UserId
    };

    public type Event = {
        #request : Request;
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

        public func errAccess(a : AccessPredicate) {
            assert request_ != null;
            request_ := null;
            // to do -- record it.
        };


    }
}
