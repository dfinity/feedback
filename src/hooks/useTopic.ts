// import { useState } from 'react';
import { Topic, useTopicStore } from '../stores/topicStore';
// import { handlePromise } from '../utils/handlers';

export default function useTopic(id: string): Topic | null | undefined {
  // const [notFound, setNotFound] = useState(false);

  const lookup = useTopicStore((state) => state.topicLookup);

  // if (notFound) {
  //   return null;
  // }

  const topic = lookup[id];
  // if (!topic) {
  //   handlePromise(
  //     useTopicStore
  //       .getState()
  //       .find(id)
  //       .then((topic) => {
  //         if (topic) {
  //           useTopicStore.setState((state) => ({
  //             topicLookup: { ...state.topicLookup, [topic.id]: topic },
  //           }));
  //         } else {
  //           setNotFound(true);
  //         }
  //       }),
  //   );
  // }
  return topic;
}
