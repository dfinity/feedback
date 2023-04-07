import Types "Types";
import Trie "mo:base/Trie";

module {
    public type State = {
        // relation : user <> team.
        var user_team : Trie.Trie2D<Types.User.Id, Types.Team.Id, ()>;
        var team_user : Trie.Trie2D<Types.Team.Id, Types.User.Id, ()>;
    }

}
