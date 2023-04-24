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

import Core "Core";

shared ({ caller = installer }) actor class Main() {

  type TopicView = Types.Topic.View;
  type UserView = Types.User.View;

  /// Stable canister state, version 0.
  /// Rather than use this directly, we use instead use the OO wrappers defined from its projections.

  stable var state_v0 : State.State = State.init(installer);
  let oOState : State.OOState = State.OO(state_v0);

  stable var history_v0 : History.History = History.init(installer);
  let logger = History.Logger(history_v0);

  let core : Core.Core = Core.Core(installer, oOState, logger);

  public shared ({ caller }) func setUserIsModerator(id : Types.User.RawId, isMod : Bool) {
    core.setUserIsModerator(caller, id, isMod);
  };

  public type SearchSort = { #votes; #activity };

  public query ({ caller }) func searchTopics(searchSort : SearchSort) : async [Types.Topic.View] {
    core.searchTopics(caller, searchSort);
  };

  public query ({ caller }) func getModeratorTopics() : async [Types.Topic.View] {
    core.getModeratorTopics(caller);
  };

  public query ({ caller }) func getTopic(id : Types.Topic.RawId) : async ?Types.Topic.View {
    core.getTopic(caller, id);
  };

  public query func validateTopic(edit : Types.Topic.Edit) : async Bool {
    core.validateTopic(edit);
  };

  public shared ({ caller }) func createTopic(edit : Types.Topic.Edit) : async ?Types.Topic.RawId {
    core.createTopic(caller, edit);
  };

  public shared ({ caller }) func importTopics(edits : [Types.Topic.ImportEdit]) {
    core.importTopics(caller, edits);
  };

  /// TEMPORARY
  public shared ({ caller }) func clearTopics__dev_tmp() {
    debug {
      oOState.topics.clear();
      oOState.userOwnsTopic.clear();
      oOState.userSubmitsTopic.clear();
      oOState.userTopicVotes.clear();
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
    core.assertCallerIsModerator(log, caller);
    log.ok();
    Snapshot.getAll(state_v0);
  };

  public query ({ caller }) func getLogEvents(start : Nat, size : Nat) : async [History.Event] {
    let log = logger.Begin(caller, #moderatorQuery);
    core.assertCallerIsModerator(log, caller);
    log.ok();
    logger.getEvents(start, size);
  };

  public query ({ caller }) func getLogEventCount() : async Nat {
    let log = logger.Begin(caller, #moderatorQuery);
    core.assertCallerIsModerator(log, caller);
    log.ok();
    logger.getSize();
  };

  public shared ({ caller }) func editTopic(id : Types.Topic.RawId, edit : Types.Topic.Edit) : async () {
    core.editTopic(caller, id, edit);
  };

  public shared ({ caller }) func voteTopic(id : Types.Topic.RawId, userVote : Types.Topic.UserVote) : async () {
    core.voteTopic(caller, id, userVote);
  };

  public shared ({ caller }) func setTopicStatus(id : Types.Topic.RawId, status : Types.Topic.Status) : async () {
    core.setTopicStatus(caller, id, status);
  };

  public shared ({ caller }) func setTopicModStatus(id : Types.Topic.RawId, modStatus : Types.Topic.ModStatus) : async () {
    core.setTopicModStatus(caller, id, modStatus);
  };

  public shared ({ caller }) func login() : async UserView {
    core.login(caller);
  };

  public query ({ caller }) func fastLogin() : async ?UserView {
    core.fastLogin(caller);
  };

};
