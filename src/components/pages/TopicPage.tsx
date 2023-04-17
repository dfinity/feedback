import { useEffect, useState } from 'react';
import { FaCircleNotch } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import 'twin.macro';
import { Topic, useTopicStore } from '../../stores/topicStore';
import { handleError } from '../../utils/handlers';
import TopicView from '../TopicView';

export default function TopicPage() {
  const [topic, setTopic] = useState<Topic | undefined>();
  const navigate = useNavigate();
  const { id } = useParams();

  const find = useTopicStore((state) => state.find);

  useEffect(() => {
    (async () => {
      try {
        const topic = id ? await find(id) : undefined;
        if (!topic) {
          handleError('Topic not found!');
          navigate('/');
        }
        setTopic(topic);
      } catch (err) {
        handleError(err, 'Error while loading topic!');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!topic) {
    return (
      <div className="flex justify-center my-5 opacity-50 text-3xl text-white">
        <FaCircleNotch tw="animate-spin [animation-duration: 2s]" />
      </div>
    );
  }

  return (
    <>
      <TopicView topic={topic} expanded={true} />
    </>
  );
}
