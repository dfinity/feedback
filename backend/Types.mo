import Hash "mo:base/Hash";
import Nat32 "mo:base/Nat32";
import Nat "mo:base/Nat";

module {

  public module Topic {
    public type Id = { #topic : RawId };
    public func idHash(i : Id) : Hash.Hash {
      switch (i) { case (#topic n) hash n };
    };
    public func idEqual(i : Id, j : Id) : Bool { i == j };

    public type RawId = Nat;

    public type Status = { #open; #next; #completed; #closed };

    public type ModStatus = { #pending; #approved; #rejected };

    public type UserVote = { #up; #down; #none };

    public type Edit = {
      // "Edit": another name could be "Info"
      title : Text;
      description : Text;
      links : [Text];
      tags : [Text];
    };

    public type ImportEdit = Edit and {
      importId : ImportId;
      status : Status;
      createTime : Int;
      editTime : Int;
    };

    public type ImportId = { #jira : Text };

    // nanosec since Unix epoch.
    // (raw IC times here).
    public type Stamp = {
      createTime : Int;
      editTime : Int; // initially = createTime
      voteTime : ?Int; // initially null
      modTime : ?Int; // initially null
      statusTime : Int; // initially = createTime
    };

    public type State = {
      edit : Edit;
      importId : ?ImportId;
      stamp : Stamp;
      status : Status;
      modStatus : ModStatus;
    };

    // all times are msec, for frontend.
    public type View = Edit and {
      id : RawId;
      importId : ?ImportId;
      isOwner : Bool;
      isEditable : Bool;
      // submitterName: Text;
      // ownerName: Text;
      createTime : Int; // msec since Unix epoch
      editTime : Int; // msec
      voteTime : ?Int; // msec
      modTime : ?Int; // msec, initially null
      statusTime : Int; // msec, initially = createTime
      upVoters : Nat;
      downVoters : Nat;
      yourVote : UserVote;
      status : Status;
      modStatus : ModStatus;
    };
  };

  public module User {
    public type Id = { #user : RawId };
    public func idHash(i : Id) : Hash.Hash {
      switch (i) { case (#user n) hash n };
    };
    public func idEqual(i : Id, j : Id) : Bool { i == j };
    public type RawId = Nat;

    public type Edit = {
      // "Edit": another name could be "Info"
      name : Text;
      bioBlurb : Text; // one-liner, like on Twitter
    };

    public type Stamp = {
      createTime : Int; // milliseconds since Unix epoch
    };

    public type State = {
      edit : Edit;
      stamp : Stamp;
    };

    public type View = {
      id : RawId;
      isModerator : Bool;
    };
  };

  public module Team {
    public type Id = { #team : RawId };
    public func idHash(i : Id) : Hash.Hash {
      switch (i) { case (#team n) hash n };
    };
    public func idEqual(i : Id, j : Id) : Bool { i == j };
    public type RawId = Nat;

    public type Edit = {
      // "Edit": another name could be "Info"
      name : Text;
      description : Text; // one-liner? may be more than one line?
    };

    public type Stamp = {
      createTime : Int; // milliseconds since Unix epoch
    };

    public type State = {
      edit : Edit;
      stamp : Stamp;
    };
  };

  /// Computes a hash from the least significant 32-bits of `n`, ignoring other bits.
  func hash(n : Nat) : Hash.Hash {
    let j = Nat32.fromNat(n);
    hashNat8([
      j & (255 << 0),
      j & (255 << 8),
      j & (255 << 16),
      j & (255 << 24),
    ]);
  };

  /// Jenkin's one at a time:
  ///
  /// https://en.wikipedia.org/wiki/Jenkins_hash_function#one_at_a_time
  ///
  func hashNat8(key : [Hash.Hash]) : Hash.Hash {
    var hash : Nat32 = 0;
    for (natOfKey in key.vals()) {
      hash := hash +% natOfKey;
      hash := hash +% hash << 10;
      hash := hash ^ (hash >> 6);
    };
    hash := hash +% hash << 3;
    hash := hash ^ (hash >> 11);
    hash := hash +% hash << 15;
    return hash;
  };

};
