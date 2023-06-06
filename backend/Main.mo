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

import Core "Core";

shared ({ caller = installer }) actor class Main() {

  type TopicView = Types.Topic.View;
  type UserView = Types.User.View;

  let sys = System.IC();

  /// Stable canister state, version 0.
  /// Rather than use this directly, we use instead use the OO wrappers defined from its projections (see uses in Core module).
  stable var state_v0 : State.State = State.init(installer);
  stable var history_v0 : History.History = History.init(sys, installer);

  let core : Core.Core = Core.Core(installer, sys, state_v0, history_v0);

  public shared ({ caller }) func setUserIsModerator(id : Types.User.RawId, isMod : Bool) : async ?() {
    core.setUserIsModerator(caller, id, isMod);
  };

  public type SearchSort = { #votes; #activity };

  public query ({ caller }) func searchTopics(searchSort : SearchSort) : async [Types.Topic.View] {
    core.searchTopics(caller, searchSort);
  };

  public query ({ caller }) func getModeratorTopics() : async ?[Types.Topic.View] {
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

  public shared ({ caller }) func importTopics(edits : [Types.Topic.ImportEdit]) : async ?() {
    core.importTopics(caller, edits);
  };

  public query ({ caller }) func getSnapshot() : async ?[Snapshot.Entry] {
    core.getSnapshot(caller);
  };

  public query ({ caller }) func getLogEvents(start : Nat, size : Nat) : async ?[History.Event] {
    core.getLogEvents(caller, start, size);
  };

  public query ({ caller }) func getLogEventCount() : async ?Nat {
    core.getLogEventCount(caller);
  };

  public shared ({ caller }) func editTopic(id : Types.Topic.RawId, edit : Types.Topic.Edit) : async ?() {
    core.editTopic(caller, id, edit);
  };

  public shared ({ caller }) func voteTopic(id : Types.Topic.RawId, userVote : Types.Topic.UserVote) : async ?() {
    core.voteTopic(caller, id, userVote);
  };

  public shared ({ caller }) func setTopicStatus(id : Types.Topic.RawId, status : Types.Topic.Status) : async ?() {
    core.setTopicStatus(caller, id, status);
  };

  public shared ({ caller }) func setTopicModStatus(id : Types.Topic.RawId, modStatus : Types.Topic.ModStatus) : async ?() {
    core.setTopicModStatus(caller, id, modStatus);
  };

  public shared ({ caller }) func login() : async ?UserView {
    core.login(caller);
  };

  public query ({ caller }) func fastLogin() : async ?UserView {
    core.fastLogin(caller);
  };

  public query ({ caller }) func getModerators() : async ?[(Types.User.Id, ())] {
    core.getModerators(caller);
  };

  public query ({ caller }) func isInstaller() : async Bool {
    caller == installer;
  };

};
