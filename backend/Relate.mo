import Trie "mo:base/Trie";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import List "mo:base/List";

module {

    public type HashPair<X, Y> =
      ( X -> Hash.Hash,
        Y -> Hash.Hash );

    public type EqualPair<X, Y> =
      ( (X, X) -> Bool,
        (Y, Y) -> Bool) ;

    func key<X>(h : X -> Hash.Hash, key : X) : Trie.Key<X> {
        { key ; hash = h(key) }
    };

    func iterEmpty<X>() : Iter.Iter<X> {
        object { public func next() : ?X { null } }
    };

    func iterAll<X>(t : Trie.Trie<X, ()>) : Iter.Iter<X> =
      object {
        var stack = ?(t, null) : List.List<Trie.Trie<X, ()>>;
        public func next() : ?X {
            switch stack {
            case null { null };
            case (?(trie, stack2)) {
                     switch trie {
                     case (#empty) {
                              stack := stack2;
                              next()
                          };
                     case (#leaf({keyvals=null})) {
                              stack := stack2;
                              next()
                          };
                     case (#leaf({size=c; keyvals=?((k2, _), kvs)})) {
                              stack := ?(#leaf({size=c-1; keyvals=kvs}), stack2);
                              ?k2.key
                          };
                     case (#branch(br)) {
                              stack := ?(br.left, ?(br.right, stack2));
                              next()
                          };
                     }
                 }
            }
        }
    };

    // Relation structures that can be stored directly in stable vars.
    public module Stable {

        // Function from A to B, represented as a data structure.
        public type Map<A, B> = {
            var map: Trie.Trie<A, B>;
        };

        // Binary relation among A and B,
        // stored in way that permits efficiently collecting
        //  - all B related to an A.
        //  - all A related to a B.
        public type BinRel<A, B> = {
            var aB: Trie.Trie2D<A, B, ()>;
            var bA: Trie.Trie2D<B, A, ()>;
        };

        // Ternary relation among A, B, C,
        // stored in way that permits efficiently collecting
        //  - all (B, C) related to an A.
        //  - all (A, C) related to a B.
        public type TernRel<A, B, C> = {
            var aB: Trie.Trie2D<A, B, C>;
            var bA: Trie.Trie2D<B, A, C>;
        };
    };

    // Ergonomic, invariant-enforcing, object-oriented wrappers for relations, rebuilt on upgrade.
    public module OO {
        // to do
        // - take hash and equal functions for key types.
        // - expose functions from this PR https://github.com/dfinity/motoko-base/pull/219/files

        public class Map<A, B>(
          stableMap : Stable.Map<A, B>,
          hash : A -> Hash.Hash,
          equal : (A, A) -> Bool)
        {
            // to do
        };

        public class BinRel<A, B>(
          stableBinRel : Stable.BinRel<A, B>,
          hash : HashPair<A, B>,
          equal : EqualPair<A, B>
        ) {
            public func getRelatedLeft(a : A) : Iter.Iter<B> {
                let t = Trie.find<A, Trie.Trie<B, ()>>(stableBinRel.aB, key<A>(hash.0, a), equal.0);
                switch t {
                case null { iterEmpty() };
                case (?t) { iterAll<B>(t) };
                }
            };

            public func getRelatedRight(b : B) : Iter.Iter<A> {
                let t = Trie.find<B, Trie.Trie<A, ()>>(stableBinRel.bA, key<B>(hash.1, b), equal.1);
                switch t {
                case null { iterEmpty() };
                case (?t) { iterAll<A>(t) };
                }
            };

            public func put(p : (A, B)) {
                let k0 = key<A>(hash.0, p.0);
                let k1 = key<B>(hash.1, p.1);
                stableBinRel.aB := Trie.put2D(stableBinRel.aB, k0, equal.0, k1, equal.1, ());
                stableBinRel.bA := Trie.put2D(stableBinRel.bA, k1, equal.1, k0, equal.0, ());
            };

            public func delete(p : (A, B)) {
                let k0 = key<A>(hash.0, p.0);
                let k1 = key<B>(hash.1, p.1);
                stableBinRel.aB := Trie.remove2D(stableBinRel.aB, k0, equal.0, k1, equal.1).0;
                stableBinRel.bA := Trie.remove2D(stableBinRel.bA, k1, equal.1, k0, equal.0).0;
            };
        };

        public class TernRel<A, B, C>(stableTernRel : Stable.TernRel<A, B, C>) {

            // to do
        };
    }
}
