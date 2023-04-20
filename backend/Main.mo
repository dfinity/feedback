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

import Types "Types";
import State "State";
import History "History";
import Relate "Relate";

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

  let log = History.Log(history_v0);

  // # OO Wrappers for entities.
  //
  // Arguments are relevant fields from state, and primary-key utility functions (hash, equal).

  let users = Relate.OO.Map(state_v0.users, Types.User.idHash, Types.User.idEqual);
  let topics = Relate.OO.Map(state_v0.topics, Types.Topic.idHash, Types.Topic.idEqual);
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

  func findUserUnwrap(caller : Principal) : Types.User.Id {
    switch (findUser(caller)) {
      case null { assert false; loop {} };
      case (?u) u;
    };
  };

  func assertCallerIsUser(caller : Principal) : Types.User.Id {
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

  func assertCallerOwnsTopic(caller : Principal, topic : Types.Topic.Id) {
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

  func assertCallerIsModerator(caller : Principal) {
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
    log.request(caller, #setUserIsModerator { user = #user id; isMod });
    assertCallerIsModerator(caller);
    ignore do ? {
      ignore users.get(#user id)!;
      userIsModerator.put(#user id);
    };
    log.ok();
  };

  public type SearchSort = { #votes; #activity };

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
            switch (t1.voteTime, t2.voteTime) {
              case (?time1, ?time2) Int.compare(time2, time1);
              case (?_, _) #less;
              case (_, ?_) #greater;
              case _ Int.compare(t2.editTime, t1.editTime);
            };
          };
        };
      },
    );
  };

  public query ({ caller }) func getModeratorTopics() : async [Types.Topic.View] {
    log.request(caller, #moderatorQuery);
    assertCallerIsModerator(caller);
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
        Int.compare(t2.editTime, t1.editTime);
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
    let internal = {
      createTime = Time.now() / 1_000_000;
      editTime = Time.now() / 1_000_000;
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

  public shared ({ caller }) func createTopic(edit : Types.Topic.Edit) : async Types.Topic.RawId {
    log.request(caller, #createTopic { edit });
    let user = assertCallerIsUser(caller);
    let id = createTopic_(user, null, edit);
    log.okWithTopicId(id);
  };

  public shared ({ caller }) func bulkCreateTopics(edits : [Types.Topic.ImportEdit]) {
    log.request(caller, #bulkCreateTopics { edits });
    let user = assertCallerIsUser(caller);
    for (edit in edits.vals()) {
      ignore createTopic_(user, ?edit.importId, edit);
    };
    log.ok();
  };

  /// TEMPORARY
  public shared func clearTopics() {
    topics.clear();
    userOwnsTopic.clear();
    userSubmitsTopic.clear();
    userTopicVotes.clear();
  };

  /// TEMPORARY -- a version without access control, to use with Candid UI during dev/testing.
  public query ({ caller }) func getLogEvents__dev_tmp(start : Nat, size : Nat) : async [History.Event] {
    log.getEvents(start, size);
  };

  /// TEMPORARY -- a version without access control, to use with Candid UI during dev/testing.
  public query ({ caller }) func getLogEventCount__dev_tmp() : async Nat {
    log.getSize();
  };

  public query ({ caller }) func getLogEvents(start : Nat, size : Nat) : async [History.Event] {
    log.request(caller, #moderatorQuery);
    assertCallerIsModerator(caller);
    log.ok();
    log.getEvents(start, size);
  };

  public query ({ caller }) func getLogEventCount() : async Nat {
    log.request(caller, #moderatorQuery);
    assertCallerIsModerator(caller);
    log.ok();
    log.getSize();
  };

  public shared ({ caller }) func editTopic(id : Types.Topic.RawId, edit : Types.Topic.Edit) : async () {
    log.request(caller, #editTopic { topic = #topic id; edit });
    assertCallerOwnsTopic(caller, #topic id);
    topics.update(
      #topic id,
      func(topic : Types.Topic.State) : Types.Topic.State {
        {
          topic with edit;
          internal = { topic.internal with editTime = Time.now() / 1_000_000 };
        };
      },
    );
    log.ok();
  };

  public shared ({ caller }) func voteTopic(id : Types.Topic.RawId, userVote : Types.Topic.UserVote) : async () {
    log.request(caller, #voteTopic { topic = #topic id; userVote });
    let success = do ? {
      // validates arguments before updating relation.
      ignore topics.get(#topic id)!;
      let user = principals.get(caller)!;
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
    log.request(caller, #setTopicStatus { topic = #topic id; status });
    assertCallerOwnsTopic(caller, #topic id);
    topics.update(#topic id, func(topic : Types.Topic.State) : Types.Topic.State { { topic with status } });
    log.ok();
  };

  public shared ({ caller }) func setTopicModStatus(id : Types.Topic.RawId, modStatus : Types.Topic.ModStatus) : async () {
    assertCallerIsModerator(caller);
    topics.update(#topic id, func(topic : Types.Topic.State) : Types.Topic.State { { topic with modStatus } });
  };

  /// Create (or get) a user Id for the given caller Id.
  /// Once created, the user Id for a given caller Id is stored and fixed.
  public shared ({ caller }) func login() : async UserView {
    log.request(caller, #login);
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
      isModerator = userIsModerator.has(#user u);
    };
  };

  /// Get the (optional) user Id for the given caller Id.
  /// Returns null when none exists yet (see `login()`).
  public query ({ caller }) func fastLogin() : async ?UserView {
    switch (principals.get(caller)) {
      case null null;
      case (?(#user u)) ?{
        id = u;
        isModerator = userIsModerator.has(#user u);
      };
    };
  };

};
