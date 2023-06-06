import BaseTime "mo:base/Time";

module {
  public type Time = object {
    now : () -> Int;
  };

  public class ICSystem() {
    public func now() : Int {
      BaseTime.now();
    };
  };

  public class UnitTest() {
    var t : Int = 0;
    public func set(t_ : Int) {
      t := t_;
    };
    public func now() : Int {
      t;
    };
  };

};
