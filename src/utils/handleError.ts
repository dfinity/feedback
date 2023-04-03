import { toast } from 'react-toastify';

export default function handleError(err: Error | string) {
  console.error(err);

  toast(typeof err === 'string' ? err : err.message || String(err), {
    type: 'error',
    autoClose: 5000,
  });
}
