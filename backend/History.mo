import Error "mo:base/Error";
import Cycles "mo:base/ExperimentalCycles";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Seq "mo:sequence/Sequence";
import Stream "mo:sequence/Stream";

import System "System";
import Types "Types";

module {

  public type UserId = Types.User.Id;
  public type TopicId = Types.Topic.Id;

  public type Request = {
    #setUserIsModerator : {
      user : UserId;
      isMod : Bool;
    };
    #createTopic : {
      edit : Types.Topic.Edit;
    };
    #importTopics : {
      edits : [Types.Topic.ImportEdit];
    };
    #clearTopics;
    #editTopic : {
      topic : TopicId;
      edit : Types.Topic.Edit;
    };
    #voteTopic : {
      topic : TopicId;
      userVote : Types.Topic.UserVote;
    };
    #setTopicStatus : {
      topic : TopicId;
      status : Types.Topic.Status;
    };
    #setTopicModStatus : {
      topic : TopicId;
      modStatus : Types.Topic.ModStatus;
    };
    #login;
    #moderatorQuery;
  };

  public type Invariant = {
    #userExists : UserId;
    #topicExists : TopicId;
  };

  public type Internal = {
    #callerIsInstaller; // Implies all access checks will pass.
    #callerIsUser : UserId; // like AccessPredicate, but always successful, and carries UserId.
    #createUser : UserId; // when a login request creates a user (the first time).
    #okAccess : AccessPredicate; // record successsful access check.
    #okCheck : Invariant;
  };

  public type Response = {
    #ok;
    #okWithTopic : { topic : TopicId };
    #okWithUser : { user : UserId };
    #err; // e.g., the user gives an invalid topic ID.
    #errAccess : AccessPredicate;
    #errCheck : Invariant;
    #errInvalidTopicEdit;
    #errLimitTopicCreate;
  };

  public type AccessPredicate = {
    #callerIsUser; // caller ID comes from outer Event type.
    #callerIsModerator;
    #callerCanEditTopic : { user : UserId; topic : TopicId };
    #callerOwnsTopic : { user : UserId; topic : TopicId };
  };

  public type RequestId = Nat;

  public type Event = {
    #install : {
      time : Int; // nano seconds
      cyclesBalance : ?Nat;
      installer : Principal;
    };
    #request : {
      requestId : RequestId;
      time : Int; // nano seconds
      caller : Principal;
      cyclesBalance : ?Nat;
      request : Request;
    };
    #internal : {
      requestId : RequestId;
      internal : Internal;
    };
    #response : {
      requestId : RequestId;
      response : Response;
    };
  };

  /// # Feedback board history representation.
  ///
  /// A record that can recover state and diagnose behavior.
  /// Can be stored in a stable variable.
  ///
  public type History = {
    var nextRequestId : Nat;
    var events : Seq.Sequence<Event>;
  };

  public func init(sys : System.System, installer : Principal) : History {
    let cyclesBalance = ?sys.cyclesBalance();
    {
      var nextRequestId = 1;
      var events = Seq.make(#install { time = sys.time(); installer; cyclesBalance });
    };
  };

  public type ReqLog = {
    internal : Internal -> ();
    ok : () -> ?();
    okIf : Bool -> ?();
    okWith : <A>(A) -> ?A;
    okWithTopicId : Types.Topic.RawId -> Types.Topic.RawId;
    okWithUserId : Types.User.RawId -> Types.User.RawId;
    errAccess : AccessPredicate -> ?None;
    errCheck : Invariant -> ?None;
    errInvalidTopicEdit : () -> ?None;
  };

  ///
  /// OO interface for `Main` canister to log all of its state-affecting update behavior.
  /// Of particular interest are access control checks, and their outcomes.
  ///
  public class Logger(sys : System.System, history : History) {

    let levels : Stream.Stream<Nat32> = Stream.Bernoulli.seedFrom(Int.abs(sys.time()));

    public func getEvents(start : Nat, size : Nat) : [Event] {
      let (_, slice, _) = Seq.slice(history.events, start, size);
      let i : Iter.Iter<Event> = Seq.iter(slice, #fwd);
      Iter.toArray(i);
    };

    public func getSize() : Nat {
      Seq.size(history.events);
    };

    func add(event : Event) {
      history.events := Seq.pushBack<Event>(
        history.events,
        levels.next(),
        event,
      );
    };

    /// # Logging API
    ///
    /// Logs are well-formed when they consist of
    /// The following pattern, once per actor message:
    /// - Request(), followed by
    /// - zero or more internal(), followed by
    /// - response, as either okX() or errX(), of some form.
    ///
    /// In dev mode, these API points check that this format is followed:
    /// - It is an error to have a request without a matching response.
    /// - It is an error to have internal checks without a matching request.
    /// - It is an error to have a response without a matching request.
    ///
    /// In production mode, we disable these checks, and tolerate
    /// the potential of ill-formed logs to avoid sanity-checking assertion
    /// failures that prevent the canister from functioning otherwise normally.
    public class Begin(caller : Principal, request : Request) : ReqLog {

      let requestId = history.nextRequestId;
      do {
        history.nextRequestId += 1;
        let cyclesBalance = ?sys.cyclesBalance();
        add(#request { time = sys.time(); caller; request; requestId; cyclesBalance });
      };

      func addResponse(response : Response) {
        add(#response({ requestId; response }));
      };

      public func internal(internal : Internal) {
        add(#internal { requestId; internal });
      };

      public func ok() : ?() {
        addResponse(#ok);
        ?();
      };

      public func okIf(b : Bool) : ?() {
        if b { ok() } else {
          addResponse(#err);
          null;
        };
      };

      public func okWith<X>(x : X) : ?X {
        ignore ok();
        ?x;
      };

      public func okWithTopicId(i : Types.Topic.RawId) : Types.Topic.RawId {
        addResponse(#okWithTopic({ topic = #topic i }));
        i;
      };

      public func okWithUserId(i : Types.User.RawId) : Types.User.RawId {
        addResponse(#okWithUser({ user = #user i }));
        i;
      };

      public func errAccess(a : AccessPredicate) : ?None {
        addResponse(#errAccess(a));
        null;
      };

      public func errCheck(i : Invariant) : ?None {
        addResponse(#errCheck(i));
        null;
      };

      public func errInvalidTopicEdit() : ?None {
        addResponse(#errInvalidTopicEdit);
        null;
      };

      public func errLimitTopicCreate() : ?None {
        addResponse(#errLimitTopicCreate);
        null;
      };
    };
  };
};
