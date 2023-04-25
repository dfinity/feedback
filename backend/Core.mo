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

module {
  type ReqLog = History.ReqLog;
  type TopicView = Types.Topic.View;
  type UserView = Types.User.View;

  public class Core(installer : Principal, stableState : State.State, history_v0 : History.History) {

    let state : State.OOState = State.OO(stableState);
    let logger = History.Logger(history_v0);

    let topicRateLimit = RateLimit.New(5, 5); // 5 per 5 seconds.

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
    func viewTopic(user : ?Types.User.Id, id : Types.Topic.Id, state : Types.Topic.State) : ?TopicView {
      if (not maybeUserIsOwner(user, id) and state.modStatus != #approved) {
        return null;
      } else {
        ?viewTopic_(user, id, state);
      };
    };

    // No access control here for user, only customization.
    // Each use of this helper has its own access control logic.
    func viewTopic_(user : ?Types.User.Id, id : Types.Topic.Id, topic : Types.Topic.State) : TopicView {
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
            isOwner = false;
            yourVote = #none;
          };
        };
        case (?user) {
          {
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
        createTime = topic.internal.createTime;
        editTime = topic.internal.editTime;
        voteTime = topic.internal.voteTime;
        modTime = topic.internal.modTime;
        statusTime = topic.internal.statusTime;
        upVoters;
        downVoters;
        status = topic.status;
        modStatus = topic.modStatus;
      };
    };

    // returns some topic view when topic is #pending.
    // returns null otherwise.
    func viewTopicAsModerator(user : Types.User.Id, id : Types.Topic.Id, state : Types.Topic.State) : ?Types.Topic.View {
      if (state.modStatus == #pending) {
        ?viewTopic_(?user, id, state);
      } else null;
    };

    public func setUserIsModerator(caller : Principal, id : Types.User.RawId, isMod : Bool) : ?() {
      do ? {
        let log = logger.Begin(caller, #setUserIsModerator { user = #user id; isMod });
        assertCallerIsModerator(log, caller)!;
        ignore state.users.get(#user id)!;
        state.userIsModerator.put(#user id);
        log.ok()!;
      };
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
          case (_, _) t0;
        },
      );
    };

    public func searchTopics(caller : Principal, searchSort : SearchSort) : [Types.Topic.View] {
      let maybeUser = findUser(caller);
      func viewAsCaller((topic : Types.Topic.Id, state : Types.Topic.State)) : ?Types.Topic.View {
        viewTopic(maybeUser, topic, state);
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

    public func getModeratorTopics(caller : Principal) : ?[Types.Topic.View] {
      do ? {
        let log = logger.Begin(caller, #moderatorQuery);
        assertCallerIsModerator(log, caller)!;
        let user = assertCallerIsUser(log, caller)!;
        func view((topic : Types.Topic.Id, state : Types.Topic.State)) : ?Types.Topic.View {
          viewTopicAsModerator(user, topic, state);
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
        viewTopic(maybeUser, #topic id, state.topics.get(#topic id)!)!;
      };
    };

    func createTopic_(user : Types.User.Id, importId : ?Types.Topic.ImportId, edit : Types.Topic.Edit) : Types.Topic.RawId {
      let topic = state.nextTopicId();
      let timeNow = Time.now();
      let internal = {
        createTime = timeNow / 1_000_000;
        modTime = null : ?Int;
        statusTime = timeNow / 1_000_000;
        editTime = timeNow / 1_000_000;
        voteTime = null : ?Int;
      };
      state.topics.put(
        #topic topic,
        {
          modStatus = #pending;
          edit;
          importId;
          internal;
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
                internal = {
                  topic.internal with
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
        assertCallerOwnsTopic(log, caller, #topic id)!;
        state.topics.update(
          #topic id,
          func(topic : Types.Topic.State) : Types.Topic.State {
            {
              topic with
              edit;
              internal = {
                topic.internal with editTime = Time.now() / 1_000_000
              };
              // TODO: moderation for approved topic edits
              modStatus = switch (topic.modStatus) {
                case (#rejected) #pending;
                case (s) s;
              };
            };
          },
        );
        log.ok()!;
      };
    };

    public func voteTopic(caller : Principal, id : Types.Topic.RawId, userVote : Types.Topic.UserVote) : ?() {
      do ? {
        let log = logger.Begin(caller, #voteTopic { topic = #topic id; userVote });
        let success = do ? {
          // validates arguments before updating relation.
          ignore state.topics.get(#topic id)!;
          let user = assertCallerIsUser(log, caller)!;
          state.userTopicVotes.put(user, #topic id, userVote);
          state.topics.update(
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
        log.okIf(success == ?())!;
      };
    };

    public func setTopicStatus(caller : Principal, id : Types.Topic.RawId, status : Types.Topic.Status) : ?() {
      do ? {
        let log = logger.Begin(caller, #setTopicStatus { topic = #topic id; status });
        assertCallerOwnsTopic(log, caller, #topic id)!;
        state.topics.update(#topic id, func(topic : Types.Topic.State) : Types.Topic.State { { topic with status; internal = { topic.internal with statusTime = Time.now() } } });
        log.ok()!;
      };
    };

    public func setTopicModStatus(caller : Principal, id : Types.Topic.RawId, modStatus : Types.Topic.ModStatus) : ?() {
      do ? {
        let log = logger.Begin(caller, #setTopicModStatus({ topic = #topic id; modStatus }));
        assertCallerIsModerator(log, caller)!;
        state.topics.update(#topic id, func(topic : Types.Topic.State) : Types.Topic.State { { topic with modStatus; internal = { topic.internal with modTime = ?Time.now() } } });
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
        log.okWith(logger.getEvents(start, size))!;
      };
    };

    public func getLogEventCount(caller : Principal) : ?Nat {
      let log = logger.Begin(caller, #moderatorQuery);
      do ? {
        assertCallerIsModerator(log, caller)!;
        log.okWith(logger.getSize())!;
      };
    };

  };
};