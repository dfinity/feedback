import Trie "mo:base/Trie";

module {

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

    // ergonomic OO wrappers, rebuilt on upgrade.
    public module OO {
        // to do
    }
}
