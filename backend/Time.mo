import Time "mo:base/Time";

module {
    public class ICSystem() {
        public func now() : Int {
            Time.now()
        }        
    }

    public class UnitTest() {
        var t : Int = 0;
        public func set(t_ : Int) {
            t := t_
        }
        public func now() : Int {
            t
        }
    }

}
