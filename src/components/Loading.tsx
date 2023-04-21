import { FaCircleNotch } from 'react-icons/fa';

export default function Loading() {
  return (
    <div className="flex justify-center my-5 opacity-50 text-3xl text-white">
      <FaCircleNotch tw="animate-spin [animation-duration: 2s]" />
    </div>
  );
}
