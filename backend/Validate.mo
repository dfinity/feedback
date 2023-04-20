import Types "Types";

module {

  public func isLink(t : Text) : Bool {
    t.size() > 0 and t.size() < 137 * 3
  };

  public func isTag(t : Text) : Bool {
    t.size() > 0 and t.size() < 137
  };

  public func arrayAll<A>(array : [A], pred : A -> Bool) : Bool {
    for (a in array.vals()) {
      if (not pred(a)) {
        return false;
      };
    };
    return true;
  };

  public module Topic {

    public func isTitle(t : Text) : Bool {
      t.size() > 0 and t.size() < 137 * 3
    };

    public func isDescription(t : Text) : Bool {
      t.size() > 0 and t.size() < 137 * 13
    };

    public func edit(e : Types.Topic.Edit) : Bool {
      isTitle(e.title) and isDescription(e.description) and arrayAll(e.links, isLink) and arrayAll(e.tags, isTag)
    };
  };
};
