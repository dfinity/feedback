import Types "Types";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Error "mo:base/Error";

import Seq "mo:sequence/Sequence";
import Stream "mo:sequence/Stream";

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
    #bulkCreateTopics : {
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

  public type Internal = {
    #callerIsInstaller;
    #callerIsUser : UserId;
    #okAccess : AccessPredicate;
  };

  public type Response = {
    #ok;
    #okWithTopic : { topic : TopicId };
    #okWithUser : { user : UserId };
    #err; // e.g., the user gives an invalid topic ID.
    #errAccess : AccessPredicate;
    #errInvalidTopicEdit;
    #errLimitTopicCreate;
  };

  public type AccessPredicate = {
    #callerIsUser; // caller ID comes from outer Event type.
    #callerIsModerator;
    #callerOwnsTopic : { user : UserId; topic : TopicId };
  };

  public type Event = {
    #install : {
      time : Int; // nano seconds
      installer : Principal;
    };
    #request : {
      time : Int; // nano seconds
      caller : Principal;
      request : Request;
    };
    #internal : Internal;
    #response : Response;
  };

  /// # Feedback board history representation.
  ///
  /// A record that can recover state and diagnose behavior.
  /// Can be stored in a stable variable.
  ///
  public type History = {
    var events : Seq.Sequence<Event>;
  };

  public func init(installer : Principal) : History {
    { var events = Seq.make(#install { time = Time.now(); installer }) };
  };

  ///
  /// OO interface for `Main` canister to log all of its state-affecting update behavior.
  /// Of particular interest are access control checks, and their outcomes.
  ///
  public class Log(history : History) {

    let levels : Stream.Stream<Nat32> = Stream.Bernoulli.seedFrom(Int.abs(Time.now()));

    public func getEvents(start : Nat, size : Nat) : [Event] {
      let (_, slice, _) = Seq.slice(history.events, start, size);
      let i : Iter.Iter<Event> = Seq.iter(slice, #fwd);
      Iter.toArray(i);
    };

    public func getSize() : Nat {
      Seq.size(history.events);
    };

    /// # Logging API
    ///
    /// Logs are well-formed when they consist of
    /// The following pattern, once per actor message:
    /// - request(), followed by
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

    public func request(caller : Principal, request : Request) {
      setRequest(request);
      add(#request { time = Time.now(); caller; request });
    };

    public func internal(i : Internal) {
      assertRequest();
      add(#internal i);
    };

    public func ok() {
      clearRequest();
      add(#response(#ok));
    };

    public func okIf(b : Bool) {
      clearRequest();
      if b { ok() } else {
        add(#response(#err));
      };
    };

    public func okWithTopicId(i : Types.Topic.RawId) : Types.Topic.RawId {
      clearRequest();
      add(#response(#okWithTopic({ topic = #topic i })));
      i;
    };

    public func okWithUserId(i : Types.User.RawId) : Types.User.RawId {
      clearRequest();
      add(#response(#okWithUser({ user = #user i })));
      i;
    };

    public func errAccess(a : AccessPredicate) {
      clearRequest();
      add(#response(#errAccess(a)));
    };

    public func errInvalidTopicEdit() : async* None {
      clearRequest();
      add(#response(#errInvalidTopicEdit));
      throw Error.reject("invalid topic edit.");
    };

    public func errLimitTopicCreate() {
      clearRequest();
      add(#response(#errLimitTopicCreate));
    };

    // -- Internal helpers --

    func add(event : Event) {
      history.events := Seq.pushBack<Event>(
        history.events,
        levels.next(),
        event,
      );
    };

    // request var is local state to
    // ensure logs are well-formed
    // (Request, followed by zero or more Internal events, ended by a Response).

    var request_ : ?Request = null;

    func setRequest(r : Request) {
      debug {
        assert request_ == null;
        request_ := ?r;
      };
    };
    func assertRequest() {
      debug {
        assert request_ != null;
      };
    };
    func clearRequest() {
      debug {
        assert request_ != null;
        request_ := null;
      };
    };

  };
};
