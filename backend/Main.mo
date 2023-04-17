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

  stable var nextUserId : Types.User.RawId = 0;
  stable var nextTeamId : Types.Team.RawId = 0;
  stable var nextTopicId : Types.Topic.RawId = 0;

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

  func assertCallerIsUser(caller : Principal) : Types.User.Id {
      switch (principals.get(caller)) {
      case null { assert false; loop { } };
      case (?user) user
      }
  };

  func assertCallerOwnsTopic(caller : Principal, topic : Types.Topic.Id) {
      switch (principals.get(caller)) {
      case null { assert false };
      case (?user) {
               assert userOwnsTopic.has(user, topic)
           }
      }
  };

  func viewTopic(user : ?Types.User.Id, topic : Types.Topic.Id, state : Types.Topic.State) : Types.Topic.UserView {
      var upVoters : Nat = 0;
      var downVoters : Nat = 0;
      for ((_, vote) in userTopicVotes.getRelatedRight(topic)) {
          switch vote {
          case (#up) upVoters += 1;
          case (#down) downVoters += 1;
          case (#none) ();
          }
      };
      let userFields = switch user {
        case null {
        { isOwner = false;
          yourVote = #none
        } };
        case (?user) {
        { isOwner = userOwnsTopic.has(user, topic);
          yourVote = switch (userTopicVotes.get(user, topic)) { case null #none; case (?v) v };
        } };
      };
      {
          userFields with
          createTime = state.internal.createTime;
          id = topic;
          upVoters;
          downVoters;
          status = state.status;
      }
  };

  public query ({ caller }) func listTopics() : async [Types.Topic.UserView] {
      let callerUser = principals.get(caller); // okay if null.
      func viewAsCaller( (topic : Types.Topic.Id, state : Types.Topic.State) ) : Types.Topic.UserView {
          viewTopic(callerUser, topic, state)
      };
      Iter.toArray(Iter.map(topics.entries(), viewAsCaller))
  };

  func createTopic_(user : Types.User.Id, edit : Types.Topic.Edit) : Types.Topic.RawId {
      let topic = nextTopicId;
      nextTopicId += 1;
      let internal = {
          createTime = Time.now() / 1_000_000;
      };
      topics.put(
        #topic topic,
        {
            edit;
            internal;
            status = #open;
        });
      userOwnsTopic.put(user, #topic topic);
      userSubmitsTopic.put(user, #topic topic);
      topic
  };

  public shared ({ caller }) func createTopic(edit : Types.Topic.Edit) : async Types.Topic.RawId {
      let user = assertCallerIsUser(caller);
      createTopic_(user, edit)
  };

  public shared ({ caller }) func bulkCreateTopics(edits : [Types.Topic.Edit]) {
      let user = assertCallerIsUser(caller);
      for (edit in edits.vals()) {
          ignore createTopic_(user, edit)
      }
  };

  /// TEMPORARY
  public shared func clearTopics() {
      topics.clear();
      userOwnsTopic.clear();
      userSubmitsTopic.clear();
      userTopicVotes.clear();
  };

  public shared ({ caller }) func editTopic(id : Types.Topic.RawId, edit : Types.Topic.Edit) : async () {
      assertCallerOwnsTopic(caller, #topic id);
      topics.update(#topic id, func (topic: Types.Topic.State) : Types.Topic.State {
          { topic with edit }
      })
  };

  public shared ({ caller }) func voteTopic(id : Types.Topic.RawId, userVote : Types.Topic.UserVote) : async () {
      ignore do ? {
          // validates arguments before updating relation.
          ignore topics.get(#topic id)!;
          let user = principals.get(caller)!;
          userTopicVotes.put(user, #topic id, userVote)
      };
  };

  public shared ({ caller }) func setTopicStatus(id : Types.Topic.RawId, status : Types.Topic.Status) : async () {
      assertCallerOwnsTopic(caller, #topic id);
      topics.update(#topic id, func (topic: Types.Topic.State) : Types.Topic.State {
          { topic with status }
      })
  };

  /// Create (or get) a user Id for the given caller Id.
  /// Once created, the user Id for a given caller Id is stored and fixed.
  public shared ({ caller }) func login() : async Types.User.RawId {
      switch(principals.get(caller)) {
      case null {
               let user = nextUserId;
               nextUserId += 1;
               principals.put(caller, #user user);
               user
           };
      case (?(#user u)) u;
      }
  };

  /// Get the (optional) user Id for the given caller Id.
  /// Returns null when none exists yet (see `login()`).
  public query ({ caller })  func fastLogin() : async ?Types.User.RawId {
      switch (principals.get(caller)) {
      case null null;
      case (?(#user u)) ?u;
      }
  };

};
