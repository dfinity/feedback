import Principal "mo:base/Principal";
import { print } "mo:base/Debug";

import Core "../Core";
import System "../System";
import State "../State";
import History "../History";

func expect<T>(name : Text, response : ?T) : T {
  switch (response) {
    case (?r) r;
    case _ {
      for (event in core.logger.getEvents(0, core.logger.getSize()).vals()) {
        print(debug_show event);
      };
      print("\n>> " # name);
      assert false;
      loop {};
    };
  };
};

let installer = Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai");
let caller = Principal.fromText("renrk-eyaaa-aaaaa-aaada-cai");
let moderator = Principal.fromText("rno2w-sqaaa-aaaaa-aaacq-cai");

let sys = System.UnitTest(5);
let core = Core.Core(installer, sys, State.init(installer), History.init(sys, installer));

let user = expect("login user", core.login(caller));
var moderatorUser = expect("login moderator", core.login(moderator));

expect("setUserIsModerator", core.setUserIsModerator(installer, moderatorUser.id, true));

moderatorUser := expect("login moderator with isModerator == true", core.login(moderator));

assert moderatorUser.isModerator;

let id = expect(
  "createTopic",
  core.createTopic(
    caller,
    {
      title = "foo";
      description = "bar";
      links = ["baz"];
      tags = ["qux"];
    },
  ),
);
do {
  // Assert topic view
  let topics = core.searchTopics(caller, #activity);
  assert topics.size() == 1;
  assert topics[0].title == "foo";
  assert topics[0].upVoters == 1;
  assert topics[0].downVoters == 0;
  assert topics[0].status == #open;
};
expect(
  "editTopic",
  core.editTopic(
    caller,
    id,
    {
      title = "foo2";
      description = "bar2";
      links = ["baz2"];
      tags = ["qux2"];
    },
  ),
);
expect(
  "voteTopic",
  core.voteTopic(caller, id, #down),
);
expect(
  "setTopicStatus",
  core.setTopicStatus(moderator, id, #completed),
);
do {
  // Assert topic view
  let topics = core.searchTopics(caller, #activity);
  assert topics.size() == 1;
  assert topics[0].title == "foo2";
  assert topics[0].upVoters == 0;
  assert topics[0].downVoters == 1;
  assert topics[0].status == #completed;
};
