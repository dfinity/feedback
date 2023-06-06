import { useNavigate } from 'react-router-dom';
import { useSessionStorage } from 'usehooks-ts';
import useIdentity from '../../hooks/useIdentity';
import { TopicInfo, useTopicStore } from '../../stores/topicStore';
import { handlePromise } from '../../utils/handlers';
import TopicForm from '../TopicForm';

export default function SubmitPage() {
  const [recentInfo, setRecentInfo] = useSessionStorage<TopicInfo | undefined>(
    'dfinity.feedback.submit',
    undefined,
  );
  const user = useIdentity();
  const create = useTopicStore((state) => state.create);
  const navigate = useNavigate();

  const onSubmit = async (info: TopicInfo) => {
    /* await */ handlePromise(
      create(info),
      'Submitting...',
      'Error while submitting!',
    ).then(() => setRecentInfo(undefined));
    navigate('/');
  };

  return user ? (
    <>
      <div tw="bg-gray-100 flex flex-col items-center px-10 py-8 rounded-xl">
        <div tw="w-full text-xl opacity-60">
          Let us know how we can improve your experience as an IC developer:
          <hr tw="my-4" />
        </div>
        <TopicForm initial={recentInfo} onSubmit={onSubmit} />
      </div>
    </>
  ) : (
    <div tw="bg-gray-100 text-xl text-center px-2 py-5 rounded-xl text-gray-600 select-none">
      Please sign in to submit feedback.
    </div>
  );
}
