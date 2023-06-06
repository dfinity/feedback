import P "mo:base/Prelude";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import List "mo:base/List";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
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
import System "System";

module {
  type ReqLog = History.ReqLog;
  type TopicView = Types.Topic.View;
  type UserView = Types.User.View;

  public class Core(installer : Principal, sys : System.System, stableState : State.State, history_v0 : History.History) {

    public let state : State.OOState = State.OO(stableState);
    public let logger = History.Logger(sys, history_v0);

    let topicRateLimit = RateLimit.New(sys, 5, 5); // 5 per 5 seconds.

    func findUser(caller : Principal) : ?Types.User.Id {
      if (Principal.isAnonymous(caller)) {
        null;
      } else {
        state.principals.get(caller);
      };
    };

    func userIsModerator_(caller : Principal, user : Types.User.Id) : Bool {
      caller == installer or state.userIsModerator.has(user);
    };

    func userCanEditTopic_(caller : Principal, user : Types.User.Id, topic : Types.Topic.Id) : Bool {
      switch (state.topics.get(topic)) {
        case null false;
        case (?topicState) {
          caller == installer or state.userIsModerator.has(user) or (topicState.modStatus != #approved and state.userOwnsTopic.has(user, topic));
        };
      };

    };

    func assertUserExists(log : ReqLog, user : Types.User.Id) : ?() {
      switch (state.users.get(user)) {
        case null {
          log.errCheck(#userExists(user));
        };
        case (?_) {
          log.internal(#okCheck(#userExists(user)));
          ?();
        };
      };
    };

    func assertTopicStateExists(log : ReqLog, topic : Types.Topic.Id) : ?Types.Topic.State {
      switch (state.topics.get(topic)) {
        case null {
          log.errCheck(#topicExists(topic));
        };
        case (?s) {
          log.internal(#okCheck(#topicExists(topic)));
          ?s;
        };
      };
    };

    func assertCallerIsUser(log : ReqLog, caller : Principal) : ?Types.User.Id {
      switch (findUser(caller)) {
        case null {
          log.errAccess(#callerIsUser);
        };
        case (?user) {
          log.internal(#callerIsUser user);
          ?user;
        };
      };
    };

    func assertCallerOwnsTopic(log : ReqLog, caller : Principal, topic : Types.Topic.Id) : ?() {
      do ? {
        let user = assertCallerIsUser(log, caller)!;
        let a = #callerOwnsTopic { user; topic };
        if (state.userOwnsTopic.has(user, topic)) {
          log.internal(#okAccess a);
        } else {
          log.errAccess(a)!;
        };
      };
    };

    func assertCallerCanEdit(log : ReqLog, caller : Principal, topic : Types.Topic.Id) : ?() {
      do ? {
        if (caller == installer) { return ?() };
        let user = assertCallerIsUser(log, caller)!;
        let topicState = assertTopicStateExists(log, topic)!;
        let a = #callerCanEditTopic { user; topic };
        if (
          state.userOwnsTopic.has(user, topic) and topicState.modStatus != #approved or userIsModerator_(caller, user)
        ) {
          log.internal(#okAccess a);
        } else {
          log.errAccess(a)!;
        };
      };
    };

    public func assertCallerIsModerator(log : ReqLog, caller : Principal) : ?() {
      do ? {
        if (caller != installer) {
          let user = assertCallerIsUser(log, caller)!;
          let a = #callerIsModerator;
          if (state.userIsModerator.has(user)) {
            log.internal(#okAccess a);
          } else {
            log.errAccess(a)!;
          };
        } else {
          log.internal(#callerIsInstaller);
        };
      };
    };

    func maybeUserIsOwner(user : ?Types.User.Id, topic : Types.Topic.Id) : Bool {
      switch user {
        case null false;
        case (?u) { state.userOwnsTopic.has(u, topic) };
      };
    };

    // returns some topic view when user owns the topic, or when the topic is approved.
    // returns null when a topic is unapproved and not owned by the optional user argument.
    func viewTopic(caller : Principal, user : ?Types.User.Id, id : Types.Topic.Id, state : Types.Topic.State) : ?TopicView {
      if (not maybeUserIsOwner(user, id) and state.modStatus != #approved) {
        return null;
      } else {
        ?viewTopic_(caller, user, id, state);
      };
    };

    // No access control here for user, only customization.
    // Each use of this helper has its own access control logic.
    func viewTopic_(caller : Principal, user : ?Types.User.Id, id : Types.Topic.Id, topic : Types.Topic.State) : TopicView {
      var upVoters : Nat = 0;
      var downVoters : Nat = 0;
      for ((_, vote) in state.userTopicVotes.getRelatedRight(id)) {
        switch vote {
          case (#up) upVoters += 1;
          case (#down) downVoters += 1;
          case (#none) {};
        };
      };
      let userFields = switch user {
        case null {
          {
            isEditable = false;
            isOwner = false;
            yourVote = #none;
          };
        };
        case (?user) {
          {
            isEditable = userCanEditTopic_(caller, user, id);
            isOwner = maybeUserIsOwner(?user, id);
            yourVote = switch (state.userTopicVotes.get(user, id)) {
              case null #none;
              case (?v) v;
            };
          };
        };
      };
      let #topic rawId = id;
      {
        topic.edit and userFields with
        id = rawId;
        importId = topic.importId;
        createTime = topic.stamp.createTime / 1000;
        editTime = topic.stamp.editTime / 1000;
        voteTime = switch (topic.stamp.voteTime) {
          case null null;
          case (?t) ?(t / 1000);
        };
        modTime = switch (topic.stamp.modTime) {
          case null null;
          case (?t) ?(t / 1000);
        };
        statusTime = topic.stamp.statusTime / 1000;
        upVoters;
        downVoters;
        status = topic.status;
        modStatus = topic.modStatus;
      };
    };

    // returns some topic view when topic is #pending.
    // returns null otherwise.
    func viewTopicAsModerator(caller : Principal, user : Types.User.Id, id : Types.Topic.Id, state : Types.Topic.State) : ?Types.Topic.View {
      if (state.modStatus == #pending) {
        ?viewTopic_(caller, ?user, id, state);
      } else null;
    };

    public func setUserIsModerator(caller : Principal, id : Types.User.RawId, isMod : Bool) : ?() {
      do ? {
        let log = logger.Begin(caller, #setUserIsModerator { user = #user id; isMod });
        assertCallerIsModerator(log, caller)!;
        assertUserExists(log, #user id)!;
        state.userIsModerator.put(#user id);
        log.ok()!;
      };
    };

    public type SearchSort = { #votes; #activity };

    // The most-recent time among all time stamps.
    func topicTime(t : Types.Topic.Stamp) : Int {
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
          case (_, _) t0;
        },
      );
    };

    public func searchTopics(caller : Principal, searchSort : SearchSort) : [Types.Topic.View] {
      let maybeUser = findUser(caller);
      func viewAsCaller((topic : Types.Topic.Id, state : Types.Topic.State)) : ?Types.Topic.View {
        viewTopic(caller, maybeUser, topic, state);
      };
      let unsorted = Iter.toArray(
        // If Iter had filterMap this could be more efficient.
        // The outer map, filter and inner map could be one pass.
        Iter.map(
          Iter.filter(
            Iter.map(state.topics.entries(), viewAsCaller),
            Option.isSome,
          ),
          func(x : ?Types.Topic.View) : Types.Topic.View {
            switch x {
              case null { assert false; loop {} }; // impossible assert false case.
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
              // For equal vote count, prefer topics with recent activity/votes.
              switch (
                Int.compare(
                  t2.upVoters : Int - t2.downVoters,
                  t1.upVoters : Int - t1.downVoters,
                )
              ) {
                case (#equal) Int.compare(topicTime(t2), topicTime(t1));
                case ord ord;
              };
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

    public func getModeratorTopics(caller : Principal) : ?[Types.Topic.View] {
      do ? {
        let log = logger.Begin(caller, #moderatorQuery);
        assertCallerIsModerator(log, caller)!;
        let user = assertCallerIsUser(log, caller)!;
        func view((topic : Types.Topic.Id, state : Types.Topic.State)) : ?Types.Topic.View {
          viewTopicAsModerator(caller, user, topic, state);
        };
        let unsorted = Iter.toArray(
          // If Iter had filterMap this could be more efficient.
          // The outer map, filter and inner map could be one pass.
          Iter.map(
            Iter.filter(
              Iter.map(state.topics.entries(), view),
              Option.isSome,
            ),
            func(x : ?Types.Topic.View) : Types.Topic.View {
              switch x {
                case null { assert false; loop {} }; // impossible assert false case.
                case (?v) v;
              };
            },
          ),
        );
        let result = Array.sort(
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
        log.okWith(result)!;
      };
    };

    public func getTopic(caller : Principal, id : Types.Topic.RawId) : ?Types.Topic.View {
      let maybeUser = findUser(caller);
      do ? {
        viewTopic(caller, maybeUser, #topic id, state.topics.get(#topic id)!)!;
      };
    };

    func createTopic_(user : Types.User.Id, importId : ?Types.Topic.ImportId, edit : Types.Topic.Edit) : Types.Topic.RawId {
      let topic = state.nextTopicId();
      let timeNow = sys.time();
      let stamp = {
        createTime = timeNow;
        modTime = null : ?Int;
        statusTime = timeNow;
        editTime = timeNow;
        voteTime = null : ?Int;
      };
      state.topics.put(
        #topic topic,
        {
          modStatus = #pending;
          edit;
          importId;
          stamp;
          status = #open;
        },
      );
      state.userOwnsTopic.put(user, #topic topic);
      state.userSubmitsTopic.put(user, #topic topic);
      topic;
    };

    public func validateTopic(edit : Types.Topic.Edit) : Bool {
      Validate.Topic.edit(edit);
    };

    public func createTopic(caller : Principal, edit : Types.Topic.Edit) : ?Types.Topic.RawId {
      do ? {
        let log = logger.Begin(caller, #createTopic { edit });
        let user = assertCallerIsUser(log, caller)!;
        switch (topicRateLimit.tick()) {
          case (#ok) {};
          case (#wait) {
            log.errLimitTopicCreate()!;
          };
        };
        if (userIsModerator_(caller, user) or Validate.Topic.edit(edit)) {
          let id = createTopic_(user, null, edit);
          voteTopic_(user, id, #up);
          log.okWithTopicId(id);
        } else {
          log.errInvalidTopicEdit()!;
        };
      };
    };

    public func importTopics(caller : Principal, edits : [Types.Topic.ImportEdit]) : ?() {
      do ? {
        let log = logger.Begin(caller, #importTopics { edits });
        assertCallerIsModerator(log, caller)!;
        let user = assertCallerIsUser(log, caller)!;
        for (edit in edits.vals()) {
          let id = createTopic_(user, ?edit.importId, edit);
          state.topics.update(
            #topic id,
            func(topic : Types.Topic.State) : Types.Topic.State {
              {
                topic with
                status = edit.status;
                stamp = {
                  topic.stamp with
                  createTime = edit.createTime;
                  editTime = edit.editTime;
                };
              };
            },
          );
        };
        log.ok()!;
      };
    };

    public func editTopic(caller : Principal, id : Types.Topic.RawId, edit : Types.Topic.Edit) : ?() {
      do ? {
        let log = logger.Begin(caller, #editTopic { topic = #topic id; edit });
        assertCallerCanEdit(log, caller, #topic id)!;
        state.topics.update(
          #topic id,
          func(topic : Types.Topic.State) : Types.Topic.State {
            {
              topic with
              edit;
              stamp = {
                topic.stamp with editTime = sys.time()
              };
              // TODO: moderation for approved topic edits
              modStatus = switch (topic.modStatus) {
                case (#rejected _) #pending;
                case (s) s;
              };
            };
          },
        );
        log.ok()!;
      };
    };

    public func voteTopic_(user : Types.User.Id, id : Types.Topic.RawId, userVote : Types.Topic.UserVote) {
      state.userTopicVotes.put(user, #topic id, userVote);
      state.topics.update(
        #topic id,
        func(topic : Types.Topic.State) : Types.Topic.State {
          {
            topic with stamp = {
              topic.stamp with voteTime = ?(sys.time())
            };
          };
        },
      );
    };

    public func voteTopic(caller : Principal, id : Types.Topic.RawId, userVote : Types.Topic.UserVote) : ?() {
      do ? {
        let log = logger.Begin(caller, #voteTopic { topic = #topic id; userVote });
        let success = do ? {
          ignore assertTopicStateExists(log, #topic id)!;
          let user = assertCallerIsUser(log, caller)!;
          voteTopic_(user, id, userVote);
        };
        log.okIf(success == ?())!;
      };
    };

    public func setTopicStatus(caller : Principal, id : Types.Topic.RawId, status : Types.Topic.Status) : ?() {
      do ? {
        let log = logger.Begin(caller, #setTopicStatus { topic = #topic id; status });
        assertCallerIsModerator(log, caller)!;
        state.topics.update(#topic id, func(topic : Types.Topic.State) : Types.Topic.State { { topic with status; stamp = { topic.stamp with statusTime = sys.time() } } });
        log.ok()!;
      };
    };

    public func setTopicModStatus(caller : Principal, id : Types.Topic.RawId, modStatus : Types.Topic.ModStatus) : ?() {
      do ? {
        let log = logger.Begin(caller, #setTopicModStatus({ topic = #topic id; modStatus }));
        assertCallerIsModerator(log, caller)!;
        state.topics.update(#topic id, func(topic : Types.Topic.State) : Types.Topic.State { { topic with modStatus; stamp = { topic.stamp with modTime = ?sys.time() } } });
        log.ok()!;
      };
    };

    /// Create (or get) a user Id for the given caller Id.
    /// Once created, the user Id for a given caller Id is stored and fixed.
    public func login(caller : Principal) : ?UserView {
      do ? {
        let log = logger.Begin(caller, #login);
        let u = switch (state.principals.get(caller)) {
          case null {
            let user = state.nextUserId();
            state.principals.put(caller, #user user);
            let initUserState : Types.User.State = {
              stamp = {
                createTime = sys.time();
              };
              edit = {
                name = "";
                bioBlurb = "";
              };
            };
            state.users.put(#user user, initUserState);
            log.internal(#createUser(#user user));
            user;
          };
          case (?(#user u)) u;
        };
        {
          id = log.okWithUserId(u);
          isModerator = userIsModerator_(caller, #user u);
        };
      };
    };

    /// Get the (optional) user Id for the given caller Id.
    /// Returns null when none exists yet (see `login()`).
    public func fastLogin(caller : Principal) : ?UserView {
      switch (state.principals.get(caller)) {
        case null null;
        case (?(#user u)) ?{
          id = u;
          isModerator = userIsModerator_(caller, #user u);
        };
      };
    };

    public func getSnapshot(caller : Principal) : ?[Snapshot.Entry] {
      do ? {
        let log = logger.Begin(caller, #moderatorQuery);
        assertCallerIsModerator(log, caller)!;
        log.okWith(Snapshot.getAll(stableState))!;
      };
    };

    public func getLogEvents(caller : Principal, start : Nat, size : Nat) : ?[History.Event] {
      do ? {
        let log = logger.Begin(caller, #moderatorQuery);
        assertCallerIsModerator(log, caller)!;
        log.ok()!; // want this response to be included in the result in next line.
        logger.getEvents(start, size);
      };
    };

    public func getLogEventCount(caller : Principal) : ?Nat {
      let log = logger.Begin(caller, #moderatorQuery);
      do ? {
        assertCallerIsModerator(log, caller)!;
        log.ok()!; // want this response to be included in the result in next line.
        logger.getSize();
      };
    };

    public func getModerators(caller : Principal) : ?[(Types.User.Id, ())] {
      let log = logger.Begin(caller, #moderatorQuery);
      do ? {
        assertCallerIsModerator(log, caller)!;
        log.ok()!;
        Iter.toArray(Trie.iter<Types.User.Id, ()>(stableState.userIsModerator.map));
      };
    };

  };
};
