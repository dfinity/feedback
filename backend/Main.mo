import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import List "mo:base/List";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";

actor {
  let feedbacks : TrieMap.TrieMap<Nat, List.List<Text>> = TrieMap.TrieMap<Nat, List.List<Text>>(Nat.equal, Hash.hash);
  stable var storedFeedbacks : List.List<(Nat, List.List<Text>)> = null;

  // Post feedback
  public func post(userId : Nat, feedback : Text) : async () {
    let currentFeedbacks = switch (feedbacks.get(userId)) {
      case (null) List.nil<Text>();
      case (?feedbackList) feedbackList;
    };
    let updatedFeedbacks = List.push(feedback, currentFeedbacks);
    feedbacks.put(userId, updatedFeedbacks);
  };

  // Get all feedback
  public query func getAll() : async [(Nat, Text)] {
    let result = Buffer.Buffer<(Nat, Text)>(10);
    for ((userId, userFeedbacks) in feedbacks.entries()) {
      List.iterate(
        userFeedbacks,
        func(feedback : Text) : () {
          result.add((userId, feedback));
        },
      );
    };
    Buffer.toArray(result);
  };

  // Get feedback submitted by a certain user
  public query func getFeedbacksBy(userId : Nat) : async [Text] {
    switch (feedbacks.get(userId)) {
      case null [];
      case (?feedbackList) List.toArray(feedbackList);
    };
  };

  // Pre-upgrade method
  system func preupgrade() : () {
    storedFeedbacks := Iter.toList(feedbacks.entries());
  };

  // Post-upgrade method
  system func postupgrade() : () {
    List.iterate(
      storedFeedbacks,
      func(entry : (Nat, List.List<Text>)) : () {
        let (userId, userFeedbacks) = entry;
        feedbacks.put(userId, userFeedbacks);
      },
    );
  };
};
