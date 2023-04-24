import P "mo:base/Prelude";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import List "mo:base/List";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Nat32 "mo:base/Nat32";
import Trie "mo:base/Trie";
import Array "mo:base/Array";
import Order "mo:base/Order";
import Option "mo:base/Option";
import Error "mo:base/Error";

import Types "Types";
import State "State";
import History "History";
import Snapshot "Snapshot";
import Relate "Relate";
import Validate "Validate";
import RateLimit "RateLimit";

shared ({ caller = installer }) actor class Main() {

  type TopicView = Types.Topic.View;
  type UserView = Types.User.View;

  /// Stable canister state, version 0.
  /// Rather than use this directly, we use instead use the OO wrappers defined from its projections.

  stable var state_v0 : State.State = State.init(installer);

  stable var history_v0 : History.History = History.init(installer);

  stable var nextUserId : Types.User.RawId = 1;
  stable var nextTeamId : Types.Team.RawId = 1;
  stable var nextTopicId : Types.Topic.RawId = 1;

  // # OO Wrapper for log.

  let logger = History.Logger(history_v0);
  type ReqLog = History.ReqLog;

  // # OO Wrappers for entities.
  //
  // Arguments are relevant fields from state, and primary-key utility functions (hash, equal).

  let users = Relate.OO.Map(state_v0.users, Types.User.idHash, Types.User.idEqual);
  let topics = Relate.OO.Map(state_v0.topics, Types.Topic.idHash, Types.Topic.idEqual);
  let topicRateLimit = RateLimit.New(137, 60); // 137 per min.
  let teams = Relate.OO.Map(state_v0.teams, Types.Team.idHash, Types.Team.idEqual);
  let principals = Relate.OO.Map(state_v0.principals, Principal.hash, Principal.equal);

  // # OO Wrappers for relations.
  //
  // Arguments are relevant fields from state, and primary-key utility functions (hash, equal).

  let userTeamMember = Relate.OO.BinRel(state_v0.userTeamMember, (Types.User.idHash, Types.Team.idHash), (Types.User.idEqual, Types.Team.idEqual));
  let userIsModerator = Relate.OO.UnRel(state_v0.userIsModerator, Types.User.idHash, Types.User.idEqual);
  let userSubmitsTopic = Relate.OO.BinRel(state_v0.userSubmitsTopic, (Types.User.idHash, Types.Topic.idHash), (Types.User.idEqual, Types.Topic.idEqual));
  let userOwnsTopic = Relate.OO.BinRel(state_v0.userOwnsTopic, (Types.User.idHash, Types.Topic.idHash), (Types.User.idEqual, Types.Topic.idEqual));
  let userTopicVotes = Relate.OO.TernRel(state_v0.userTopicVotes, (Types.User.idHash, Types.Topic.idHash), (Types.User.idEqual, Types.Topic.idEqual));

  func findUser(caller : Principal) : ?Types.User.Id {
    if (Principal.isAnonymous(caller)) {
      null;
    } else {
      principals.get(caller);
    };
  };

  func userIsModerator_(caller : Principal, user : Types.User.Id) : Bool {
    caller == installer or userIsModerator.has(user);
  };

  func findUserUnwrap(caller : Principal) : Types.User.Id {
    switch (findUser(caller)) {
      case null { assert false; loop {} };
      case (?u) u;
    };
  };

  func assertCallerIsUser(log : ReqLog, caller : Principal) : Types.User.Id {
    switch (findUser(caller)) {
      case null {
        log.errAccess(#callerIsUser);
        assert false;
        loop {};
      };
      case (?user) {
        log.internal(#callerIsUser user);
        user;
      };
    };
  };

  func assertCallerOwnsTopic(log : ReqLog, caller : Principal, topic : Types.Topic.Id) {
    switch (findUser(caller)) {
      case null {
        log.errAccess(#callerIsUser);
        assert false;
      };
      case (?user) {
        let a = #callerOwnsTopic { user; topic };
        if (userOwnsTopic.has(user, topic)) {
          log.internal(#okAccess a);
        } else {
          log.errAccess(a);
          assert false;
        };
      };
    };
  };

  func assertCallerIsModerator(log : ReqLog, caller : Principal) {
    if (caller != installer) {
      switch (findUser(caller)) {
        case null {
          log.errAccess(#callerIsUser);
          assert false;
        };
        case (?user) {
          let a = #callerIsModerator;
          if (userIsModerator.has(user)) {
            log.internal(#okAccess a);
          } else {
            log.errAccess(a);
            assert false;
          };
        };
      };
    } else {
      log.internal(#callerIsInstaller);
    };
  };

  func maybeUserIsOwner(user : ?Types.User.Id, topic : Types.Topic.Id) : Bool {
    switch user { case null false; case (?u) { userOwnsTopic.has(u, topic) } };
  };

  // returns some topic view when user owns the topic, or when the topic is approved.
  // returns null when a topic is unapproved and not owned by the optional user argument.
  func viewTopic(user : ?Types.User.Id, id : Types.Topic.Id, state : Types.Topic.State) : ?TopicView {
    if (not maybeUserIsOwner(user, id) and state.modStatus != #approved) {
      return null;
    } else {
      ?viewTopic_(user, id, state);
    };
  };

  // No access control here for user, only customization.
  // Each use of this helper has its own access control logic.
  func viewTopic_(user : ?Types.User.Id, id : Types.Topic.Id, state : Types.Topic.State) : TopicView {
    var upVoters : Nat = 0;
    var downVoters : Nat = 0;
    for ((_, vote) in userTopicVotes.getRelatedRight(id)) {
      switch vote {
        case (#up) upVoters += 1;
        case (#down) downVoters += 1;
        case (#none) {};
      };
    };
    let userFields = switch user {
      case null {
        {
          isOwner = false;
          yourVote = #none;
        };
      };
      case (?user) {
        {
          isOwner = maybeUserIsOwner(?user, id);
          yourVote = switch (userTopicVotes.get(user, id)) {
            case null #none;
            case (?v) v;
          };
        };
      };
    };
    let #topic rawId = id;
    {
      state.edit and userFields with
      id = rawId;
      importId = state.importId;
      createTime = state.internal.createTime;
      editTime = state.internal.editTime;
      voteTime = state.internal.voteTime;
      modTime = state.internal.modTime;
      statusTime = state.internal.statusTime;
      upVoters;
      downVoters;
      status = state.status;
      modStatus = state.modStatus;
    };
  };

  // returns some topic view when topic is #pending.
  // returns null otherwise.
  func viewTopicAsModerator(user : Types.User.Id, id : Types.Topic.Id, state : Types.Topic.State) : ?Types.Topic.View {
    if (state.modStatus == #pending) {
      ?viewTopic_(?user, id, state);
    } else null;
  };

  public shared ({ caller }) func setUserIsModerator(id : Types.User.RawId, isMod : Bool) {
    let log = logger.Begin(caller, #setUserIsModerator { user = #user id; isMod });
    assertCallerIsModerator(log, caller);
    ignore do ? {
      ignore users.get(#user id)!;
      userIsModerator.put(#user id);
    };
    log.ok();
  };

  public type SearchSort = { #votes; #activity };

  // The most-recent time among all time stamps.
  func topicTime(t : Types.Topic.Internal) : Int {
    let t0 = Int.max(
      t.editTime,
      Int.max(
        t.createTime,
        t.statusTime,
      ),
    );
    Int.max(
      t0,
      switch (t.voteTime, t.modTime) {
        case (?t1, ?t2) Int.max(t1, t2);
        case (_, ?t2) t2;
        case (?t1, _) t1;
      },
    );
  };

  public query ({ caller }) func searchTopics(searchSort : SearchSort) : async [Types.Topic.View] {
    let maybeUser = findUser(caller);
    func viewAsCaller((topic : Types.Topic.Id, state : Types.Topic.State)) : ?Types.Topic.View {
      viewTopic(maybeUser, topic, state);
    };
    let unsorted = Iter.toArray(
      // If Iter had filterMap this could be more efficient.
      // The outer map, filter and inner map could be one pass.
      Iter.map(
        Iter.filter(
          Iter.map(topics.entries(), viewAsCaller),
          Option.isSome,
        ),
        func(x : ?Types.Topic.View) : Types.Topic.View {
          switch x {
            case null { assert false; loop {} };
            case (?v) v;
          };
        },
      ),
    );
    Array.sort(
      unsorted,
      func(
        t1 : Types.Topic.View,
        t2 : Types.Topic.View,
      ) : Order.Order {
        switch searchSort {
          case (#votes) {
            // Compare size of net votes.
            // More goes first, meaning bigger is "less".
            Int.compare(
              t2.upVoters : Int - t2.downVoters,
              t1.upVoters : Int - t1.downVoters,
            );
          };
          case (#activity) {
            // Prefer topics with recent votes.
            // If no votes at all, then use edit time.
            // In all cases "bigger time" is "less."
            Int.compare(topicTime(t2), topicTime(t1));
          };
        };
      },
    );
  };

  public query func debugTopicRateLimit() : async {
    entries : [Int];
    entry_index : Nat;
  } {
    topicRateLimit.debugGet();
  };

  public query ({ caller }) func getModeratorTopics() : async [Types.Topic.View] {
    let log = logger.Begin(caller, #moderatorQuery);
    assertCallerIsModerator(log, caller);
    log.ok();

    let user = findUserUnwrap(caller);
    func view((topic : Types.Topic.Id, state : Types.Topic.State)) : ?Types.Topic.View {
      viewTopicAsModerator(user, topic, state);
    };
    let unsorted = Iter.toArray(
      // If Iter had filterMap this could be more efficient.
      // The outer map, filter and inner map could be one pass.
      Iter.map(
        Iter.filter(
          Iter.map(topics.entries(), view),
          Option.isSome,
        ),
        func(x : ?Types.Topic.View) : Types.Topic.View {
          switch x {
            case null { assert false; loop {} };
            case (?v) v;
          };
        },
      ),
    );
    Array.sort(
      unsorted,
      func(
        t1 : Types.Topic.View,
        t2 : Types.Topic.View,
      ) : Order.Order {
        // Prefer topics with recent edits.
        // In all cases "bigger time" is "less" (earlier).
        Int.compare(topicTime(t2), topicTime(t1));
      },
    );
  };

  public query ({ caller }) func getTopic(id : Types.Topic.RawId) : async ?Types.Topic.View {
    let maybeUser = findUser(caller);
    do ? {
      viewTopic(maybeUser, #topic id, topics.get(#topic id)!)!;
    };
  };

  func createTopic_(user : Types.User.Id, importId : ?Types.Topic.ImportId, edit : Types.Topic.Edit) : Types.Topic.RawId {
    let topic = nextTopicId;
    nextTopicId += 1;
    let timeNow = Time.now();
    let internal = {
      createTime = timeNow / 1_000_000;
      modTime = null : ?Int;
      statusTime = timeNow / 1_000_000;
      editTime = timeNow / 1_000_000;
      voteTime = null : ?Int;
    };
    topics.put(
      #topic topic,
      {
        modStatus = #pending;
        edit;
        importId;
        internal;
        status = #open;
      },
    );
    userOwnsTopic.put(user, #topic topic);
    userSubmitsTopic.put(user, #topic topic);
    topic;
  };

  public query func validateTopic(edit : Types.Topic.Edit) : async Bool {
    Validate.Topic.edit(edit);
  };

  public shared ({ caller }) func createTopic(edit : Types.Topic.Edit) : async Types.Topic.RawId {
    let log = logger.Begin(caller, #createTopic { edit });
    let user = assertCallerIsUser(log, caller);
    switch (topicRateLimit.tick()) {
      case (#ok) {};
      case (#wait) {
        log.errLimitTopicCreate();
        throw Error.reject("reached rate limit for topic creation."); // putting this throw within errLimitTopicCreate leads to compiler bug.
      };
    };
    if (userIsModerator_(caller, user) or Validate.Topic.edit(edit)) {
      let id = createTopic_(user, null, edit);
      log.okWithTopicId(id);
    } else {
      await* log.errInvalidTopicEdit();
    };
  };

  public shared ({ caller }) func importTopics(edits : [Types.Topic.ImportEdit]) {
    let log = logger.Begin(caller, #importTopics { edits });
    assertCallerIsModerator(log, caller);
    let user = assertCallerIsUser(log, caller);
    for (edit in edits.vals()) {
      let id = createTopic_(user, ?edit.importId, edit);
      topics.update(
        #topic id,
        func(topic : Types.Topic.State) : Types.Topic.State {
          {
            topic with
            status = edit.status;
            internal = {
              topic.internal with
              createTime = edit.createTime;
              editTime = edit.editTime;
            };
          };
        },
      );
    };
    log.ok();
  };

  /// TEMPORARY
  public shared ({ caller }) func clearTopics__dev_tmp() {
    debug {
      topics.clear();
      userOwnsTopic.clear();
      userSubmitsTopic.clear();
      userTopicVotes.clear();
    };
  };

  /// TEMPORARY -- a version without access control, to use with Candid UI during dev/testing.
  public query ({ caller }) func getSnapshot__dev_tmp() : async [Snapshot.Entry] {
    Snapshot.getAll(state_v0);
  };

  /// TEMPORARY -- a version without access control, to use with Candid UI during dev/testing.
  public query ({ caller }) func getLogEvents__dev_tmp(start : Nat, size : Nat) : async [History.Event] {
    logger.getEvents(start, size);
  };

  /// TEMPORARY -- a version without access control, to use with Candid UI during dev/testing.
  public query ({ caller }) func getLogEventCount__dev_tmp() : async Nat {
    logger.getSize();
  };

  public query ({ caller }) func getSnapshot() : async [Snapshot.Entry] {
    let log = logger.Begin(caller, #moderatorQuery);
    assertCallerIsModerator(log, caller);
    log.ok();
    Snapshot.getAll(state_v0);
  };

  public query ({ caller }) func getLogEvents(start : Nat, size : Nat) : async [History.Event] {
    let log = logger.Begin(caller, #moderatorQuery);
    assertCallerIsModerator(log, caller);
    log.ok();
    logger.getEvents(start, size);
  };

  public query ({ caller }) func getLogEventCount() : async Nat {
    let log = logger.Begin(caller, #moderatorQuery);
    assertCallerIsModerator(log, caller);
    log.ok();
    logger.getSize();
  };

  public shared ({ caller }) func editTopic(id : Types.Topic.RawId, edit : Types.Topic.Edit) : async () {
    let log = logger.Begin(caller, #editTopic { topic = #topic id; edit });
    assertCallerOwnsTopic(log, caller, #topic id);
    topics.update(
      #topic id,
      func(topic : Types.Topic.State) : Types.Topic.State {
        {
          topic with
          edit;
          internal = { topic.internal with editTime = Time.now() / 1_000_000 };
          // TODO: moderation for approved topic edits
          modStatus = switch (topic.modStatus) {
            case (#rejected) #pending;
            case (s) s;
          };
        };
      },
    );
    log.ok();
  };

  public shared ({ caller }) func voteTopic(id : Types.Topic.RawId, userVote : Types.Topic.UserVote) : async () {
    let log = logger.Begin(caller, #voteTopic { topic = #topic id; userVote });
    let success = do ? {
      // validates arguments before updating relation.
      ignore topics.get(#topic id)!;
      let user = assertCallerIsUser(log, caller);
      userTopicVotes.put(user, #topic id, userVote);
      topics.update(
        #topic id,
        func(topic : Types.Topic.State) : Types.Topic.State {
          {
            topic with internal = {
              topic.internal with voteTime = ?(Time.now() / 1_000_000)
            };
          };
        },
      );
    };
    log.okIf(success == ?());
  };

  public shared ({ caller }) func setTopicStatus(id : Types.Topic.RawId, status : Types.Topic.Status) : async () {
    let log = logger.Begin(caller, #setTopicStatus { topic = #topic id; status });
    assertCallerOwnsTopic(log, caller, #topic id);
    topics.update(#topic id, func(topic : Types.Topic.State) : Types.Topic.State { { topic with status; internal = { topic.internal with statusTime = Time.now() } } });
    log.ok();
  };

  public shared ({ caller }) func setTopicModStatus(id : Types.Topic.RawId, modStatus : Types.Topic.ModStatus) : async () {
    let log = logger.Begin(caller, #setTopicModStatus({ topic = #topic id; modStatus }));
    assertCallerIsModerator(log, caller);
    topics.update(#topic id, func(topic : Types.Topic.State) : Types.Topic.State { { topic with modStatus; internal = { topic.internal with modTime = ?Time.now() } } });
    log.ok();
  };

  /// Create (or get) a user Id for the given caller Id.
  /// Once created, the user Id for a given caller Id is stored and fixed.
  public shared ({ caller }) func login() : async UserView {
    let log = logger.Begin(caller, #login);
    let u = switch (principals.get(caller)) {
      case null {
        let user = nextUserId;
        nextUserId += 1;
        principals.put(caller, #user user);
        user;
      };
      case (?(#user u)) u;
    };
    {
      id = log.okWithUserId(u);
      isModerator = userIsModerator_(caller, #user u);
    };
  };

  /// Get the (optional) user Id for the given caller Id.
  /// Returns null when none exists yet (see `login()`).
  public query ({ caller }) func fastLogin() : async ?UserView {
    switch (principals.get(caller)) {
      case null null;
      case (?(#user u)) ?{
        id = u;
        isModerator = userIsModerator_(caller, #user u);
      };
    };
  };

};
