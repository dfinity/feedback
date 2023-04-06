import { FeedbackBoard } "Main";

let service = await FeedbackBoard();
let id = await service.create({
  title = "foo";
  description = "bar";
  links = ["baz"];
  tags = ["qux"];
});
do { // Assert topic view
  let topics = await service.fetch();
  assert topics.size() == 1;
  assert topics[0].title == "foo";
  assert topics[0].upVoters == 0;
  assert topics[0].downVoters == 0;
  assert topics[0].status == #open;
};
await service.edit(
  id,
  {
    title = "foo2";
    description = "bar2";
    links = ["baz2"];
    tags = ["qux2"];
  },
);
await service.vote(id, #up);
await service.changeStatus(id, #completed);
do {  // Assert topic view
  let topics = await service.fetch();
  assert topics.size() == 1;
  assert topics[0].title == "foo2";
  assert topics[0].upVoters == 1;
  assert topics[0].downVoters == 0;
  assert topics[0].status == #completed;
}
