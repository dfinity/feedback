import { toast } from 'react-toastify';

export function handlePromise<T>(
  promise: Promise<T>,
  message?: string | undefined,
  errMessage?: string | undefined,
): Promise<T> {
  toast.promise(
    promise.catch((err) => handleError(err, errMessage)),
    {
      pending: message,
    },
  );
  return promise;
}

export function handleError(err: Error | string, message?: string | undefined) {
  console.error(err);
  toast(
    message || (typeof err === 'string' ? err : err.message || String(err)),
    {
      type: 'error',
      autoClose: 5000,
    },
  );
}
