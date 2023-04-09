import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import List "mo:base/List";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Nat32 "mo:base/Nat32";
import Trie "mo:base/Trie";
import Types "Types";
import P "mo:base/Prelude";

actor class FeedbackBoard() {

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

  // create (or get) a user Id for the given caller Id.
  // once created, the user Id for a given caller Id is stored and fixed.
  public func login() : async Types.User.RawId {
      P.xxx()
  };

  // get the (optional) user Id for the given caller Id.
  // null when none exists yet (see login()).
  public query func fastLogin() : async ?Types.User.RawId {
      P.xxx()
  };

};
