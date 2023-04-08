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

  public shared ({ caller }) func userVote(id : Types.Topic.RawId, userVote : Types.Topic.UserVote) : async () {
      P.xxx()
  };

  public func topicSetStatus(id : Types.Topic.RawId, status : Types.Topic.Status) : async () {
      P.xxx()
  };

};
