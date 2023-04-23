import { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import 'twin.macro';
import { backend } from '../../declarations/backend';
import { Event } from '../../declarations/backend/backend.did';
import useIdentity from '../../hooks/useIdentity';
import { handleError } from '../../utils/handlers';
import Loading from '../Loading';

interface EventItemProps {
  event: Event;
}

function EventItem({ event }: EventItemProps) {
  return (
    <div>
      {/* TODO */}
      <pre>{JSON.stringify(event, null, 2)}</pre>
    </div>
  );
}

const StyledEventItem = styled(EventItem)`
  /* TODO: custom CSS */
  background: #eee;
`;

export default function HistoryPage() {
  const [events, setEvents] = useState<Event[] | undefined>();

  const user = useIdentity();

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const events = await backend.getLogEvents(BigInt(0), BigInt(1000));
          setEvents(events);
        } catch (err) {
          handleError(err, 'Error while fetching history!');
        }
      })();
    }
  }, [user]);

  if (!events) {
    return <Loading />;
  }

  return (
    <>
      {events.length === 0 && (
        <div tw="bg-gray-100 text-xl text-center px-2 py-5 rounded-xl text-gray-600 select-none">
          History is empty!
        </div>
      )}
      <div tw="flex flex-col gap-4 mx-auto">
        {events.map((event, i) => (
          <div key={i}>
            <StyledEventItem event={event} />
          </div>
        ))}
      </div>
    </>
  );
}
