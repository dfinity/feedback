import { useNavigate } from 'react-router-dom';
import {
  FeedbackItemDetails,
  useFeedbackStore,
} from '../../stores/feedbackStore';
import { useIdentityStore } from '../../stores/identityStore';
import FeedbackForm from '../FeedbackForm';

export default function SubmitPage() {
  const user = useIdentityStore((state) => state.user);
  const create = useFeedbackStore((state) => state.create);
  const navigate = useNavigate();

  const onSubmit = (details: FeedbackItemDetails) => {
    create(details).catch((err) => {
      // TODO: handle errors
      throw err;
    });
    navigate('/');
  };

  return user ? (
    <>
      <div tw="flex flex-col items-center px-10 py-8 bg-white rounded-xl">
        <FeedbackForm onSubmit={onSubmit} />
      </div>
    </>
  ) : (
    <div tw="text-xl text-center bg-white px-2 py-5 rounded-xl text-gray-800">
      Please sign in to submit feedback.
    </div>
  );
}
