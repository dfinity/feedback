import { useEffect, useState } from 'react';
import { FaCircleNotch } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import 'twin.macro';
import { Topic, useTopicStore } from '../../stores/topicStore';
import { handleError } from '../../utils/handlers';
import TopicView from '../TopicView';

export default function TopicPage() {
  const [topic, setTopic] = useState<Topic | undefined>();
  const [fetchId, setFetchId] = useState<string | undefined>();

  const find = useTopicStore((state) => state.find);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id && id !== fetchId) {
      setFetchId(id);
      (async () => {
        try {
          if (!id) {
            return;
          }
          const topic = await find(id);
          if (!topic) {
            handleError('Topic not found!');
            // navigate('/');
          } else {
            setTopic(topic);
          }
        } catch (err) {
          handleError(err, 'Error while loading topic!');
        }
      })();
    }
  }, [find, id, navigate, fetchId]);

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
