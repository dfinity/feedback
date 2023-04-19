import { Main } "../Main";

let service = await Main();

let id = await service.createTopic({
  title = "foo";
  description = "bar";
  links = ["baz"];
  tags = ["qux"];
});
do {
  // Assert topic view
  let topics = await service.listTopics();
  assert topics.size() == 1;
  assert topics[0].title == "foo";
  assert topics[0].upVoters == 0;
  assert topics[0].downVoters == 0;
  assert topics[0].status == #open;
};
await service.editTopic(
  id,
  {
    title = "foo2";
    description = "bar2";
    links = ["baz2"];
    tags = ["qux2"];
  },
);
await service.voteTopic(id, #up);
await service.setTopicStatus(id, #completed);
do {
  // Assert topic view
  let topics = await service.listTopics();
  assert topics.size() == 1;
  assert topics[0].title == "foo2";
  assert topics[0].upVoters == 1;
  assert topics[0].downVoters == 0;
  assert topics[0].status == #completed;
};
