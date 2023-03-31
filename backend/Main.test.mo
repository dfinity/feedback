import { FeedbackBoard } "Main";

let service = await FeedbackBoard();
let id = await service.create({
  title = "foo";
  description = "bar";
  links = ["baz"];
  tags = ["qux"];
});
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
