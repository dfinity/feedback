import Array "mo:base/Array";
import Time "mo:base/Time";

import System "System";

module {

  public class New(sys : System.System, limit_count : Nat, limit_seconds : Nat) {

    public func doCount() : Nat {
      let t0 = start();
      var count = 0;
      for (time in entries.vals()) {
        if (time >= t0) count += 1;
      };
      count;
    };

    // check if the rate limit is reached.
    // returns #ok when the rate limit has not been reached.
    // returns #wait when it has.
    public func check() : { #wait; #ok } {
      if (doCount() >= limit_count) {
        #wait;
      } else { #ok };
    };

    // attempt to "tick" the current time.
    // returns #ok when the rate limit has not been reached.
    // returns #wait when it has.
    public func tick() : { #wait; #ok } {
      if (check() == #wait) { #wait } else {
        add(sys.time());
        #ok;
      };
    };

    public func debugGet() : { entries : [Int]; entry_index : Nat; count : Nat } = {
      entries = Array.freeze(entries);
      entry_index;
      count = doCount();
    };

    // -- internals helpers --

    var entry_index = 0;

    // The start of the current time window.
    func start() : Int {
      sys.time() - limit_seconds * 1_000_000_000;
    };

    // all initial time entries are far enough in the
    // past that they do not affect the current count.
    let epoch = start();

    let entries = Array.tabulateVar<Int>(
      limit_count,
      func(i : Nat) : Int { epoch },
    );

    func add(time : Int) {
      entry_index := (entry_index + 1) % limit_count;
      entries[entry_index] := time;
    };

  };

};
