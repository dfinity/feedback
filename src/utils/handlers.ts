import { toast } from 'react-toastify';

export function handlePromise(
  promise: Promise<any>,
  message: string,
  errMessage?: string,
) {
  toast.promise(
    promise.catch((err) => handleError(errMessage || err)),
    {
      pending: message,
    },
  );
}

export function handleError(err: Error | string) {
  console.error(err);

  toast(typeof err === 'string' ? err : err.message || String(err), {
    type: 'error',
    autoClose: 5000,
  });
}
