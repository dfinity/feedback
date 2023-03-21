import { Main } "./Main";

let service = await Main();

assert (await service.get()) == 0;

await service.inc();

assert (await service.get()) == 1;
