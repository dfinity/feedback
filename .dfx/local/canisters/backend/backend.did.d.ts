import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'add' : ActorMethod<[bigint], undefined>,
  'get' : ActorMethod<[], bigint>,
  'inc' : ActorMethod<[], undefined>,
}
