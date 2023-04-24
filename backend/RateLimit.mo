import Array "mo:base/Array";
import Time "mo:base/Time";

module {

  public class New(limit_count : Nat, limit_seconds : Nat) {

    // check if the rate limit is reached.
    // returns #ok when the rate limit has not been reached.
    // returns #wait when it has.
    public func check() : { #wait; #ok } {
      let t0 = start();
      var count = 0;
      for (time in entries.vals()) {
        if (time >= t0) count += 1;
      };
      if (count > limit_count) #wait else #ok;
    };

    // attempt to "tick" the current time.
    // returns #ok when the rate limit has not been reached.
    // returns #wait when it has.
    public func tick() : { #wait; #ok } {
      if (check() == #wait) { #wait } else {
        add(Time.now());
        #ok;
      };
    };

    public func debugGet() : { entries : [Int]; entry_index : Nat } = {
      entries = Array.freeze(entries);
      entry_index;
    };

    // -- internals helpers --

    var entry_index = 0;

    // The start of the current time window.
    func start() : Int {
      Time.now() - limit_seconds * 1_000_000_000;
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
