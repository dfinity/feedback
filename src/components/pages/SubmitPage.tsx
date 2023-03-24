import { useNavigate } from 'react-router-dom';
import { TopicInfo, useTopicStore } from '../../stores/topicStore';
import { useIdentityStore } from '../../stores/identityStore';
import TopicForm from '../TopicForm';

export default function SubmitPage() {
  const user = useIdentityStore((state) => state.user);
  const create = useTopicStore((state) => state.create);
  const navigate = useNavigate();

  const onSubmit = (info: TopicInfo) => {
    create(info).catch((err) => {
      // TODO: handle errors
      throw err;
    });
    navigate('/');
  };

  return user ? (
    <>
      <div tw="bg-gray-100 flex flex-col items-center px-10 py-8 rounded-xl">
        <TopicForm onSubmit={onSubmit} />
      </div>
    </>
  ) : (
    <div tw="bg-gray-100 text-xl text-center px-2 py-5 rounded-xl text-gray-600 select-none">
      Please sign in to submit feedback.
    </div>
  );
}
