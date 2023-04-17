import P "mo:base/Prelude";
import Nat "mo:base/Nat";
import List "mo:base/List";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Nat32 "mo:base/Nat32";
import Trie "mo:base/Trie";
import Types "Types";
import State "State";
import Relate "Relate";

actor class Main() {

  /// Stable canister state, version 0.
  /// Rather than use this directly, we use instead use the OO wrappers defined from its projections.

  stable var state_v0 : State.State = State.init();

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
  let userSubmitsTopic = Relate.OO.BinRel(state_v0.userSubmitsTopic, (Types.User.idHash, Types.Topic.idHash), (Types.User.idEqual, Types.Topic.idEqual));
  let userOwnsTopic = Relate.OO.BinRel(state_v0.userOwnsTopic, (Types.User.idHash, Types.Topic.idHash), (Types.User.idEqual, Types.Topic.idEqual));
  let userTopicVotes = Relate.OO.TernRel(state_v0.userTopicVotes, (Types.User.idHash, Types.Topic.idHash), (Types.User.idEqual, Types.Topic.idEqual));


  public query ({ caller }) func listTopics() : async [Types.Topic.UserView] {
      P.xxx()
  };

  public shared ({ caller }) func createTopic(edit : Types.Topic.Edit) : async Types.Topic.RawId {
      P.xxx()
  };

  public func editTopic(id : Types.Topic.RawId, edit : Types.Topic.Edit) : async () {
      P.xxx()
  };

  public shared ({ caller }) func voteTopic(id : Types.Topic.RawId, userVote : Types.Topic.UserVote) : async () {
      P.xxx()
  };

  public func setTopicStatus(id : Types.Topic.RawId, status : Types.Topic.Status) : async () {
      P.xxx()
  };

  /// Create (or get) a user Id for the given caller Id.
  /// Once created, the user Id for a given caller Id is stored and fixed.
  public func login() : async Types.User.RawId {
      P.xxx()
  };

  /// Get the (optional) user Id for the given caller Id.
  /// Returns null when none exists yet (see `login()`).
  public query func fastLogin() : async ?Types.User.RawId {
      P.xxx()
  };

};
