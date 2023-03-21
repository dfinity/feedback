export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'add' : IDL.Func([IDL.Nat], [], ['oneway']),
    'get' : IDL.Func([], [IDL.Nat], ['query']),
    'inc' : IDL.Func([], [], ['oneway']),
  });
};
export const init = ({ IDL }) => { return []; };
