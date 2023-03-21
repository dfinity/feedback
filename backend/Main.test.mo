import { Main } "./Main";

let service = await Main();

assert (await service.getAll()) == [];
await service.post(0, "foo");
assert (await service.getFor(0)) == "foo";
