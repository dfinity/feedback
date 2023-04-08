module {

  public module Topic {
      public type Id = { #topic: RawId };
      public type RawId = Nat;

      public type Status = { #open; #next; #completed; #closed };

      public type UserVote = { #up; #down; #none };

      public type Edit = {
          title : Text;
          description : Text;
          links : [Text];
          tags : [Text];
      };

      public type Internal = {
          submitter : User.Id;
          owner : User.Id;
          createTime : Int; // milliseconds since Unix epoch
      };

      public type UserView = {
          id : Id;
          isOwner : Bool;
          submitterName: Text;
          ownerName: Text;
          createTime : Int; // milliseconds since Unix epoch
          upVoters : Nat;
          downVoters : Nat;
          status : Status;
      };
  };

  public module User {
      public type Id = { #user: RawId };
      public type RawId = Nat;

      public type Internal = {
          createTime : Int; // milliseconds since Unix epoch
      };

      public type Info = {
          name : Text;
          bioBlurb: Text; // one-liner, like on Twitter
      };
  };

  public module Team {
      public type Id = { #team: RawId };
      public type RawId = Nat;

      public type Internal = {
          createTime : Int; // milliseconds since Unix epoch
      };

      public type Info = {
          name : Text;
          description: Text; // one-linear? may be more than one line?
      };
  }
}
