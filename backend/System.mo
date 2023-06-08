import Time "mo:base/Time";
import Cycles "mo:base/ExperimentalCycles";

module {
  public type System = {
    time : () -> Int;
    cyclesBalance : () -> Nat;
  };

  public class IC() {
    public func time() : Int {
      Time.now();
    };
    public func cyclesBalance() : Nat {
      Cycles.balance();
    };
  };

  public class UnitTest(deltaTime : Nat) {
    public var _time : Int = 0;
    public var _cyclesBalance = 0;

    public func time() : Int {
      let t0 = _time;
      _time += deltaTime;
      t0;
    };
    public func cyclesBalance() : Nat {
      _cyclesBalance;
    };
  };

};
