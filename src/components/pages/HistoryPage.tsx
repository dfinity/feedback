import { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { backend } from '../../declarations/backend';
import { Event } from '../../declarations/backend/backend.did';
import useIdentity from '../../hooks/useIdentity';
import { handleError } from '../../utils/handlers';
import Loading from '../Loading';

const EventCard = tw.div`bg-gray-100 px-5 py-3 rounded-xl`;

interface EventItemProps {
  event: Event;
}

function EventItem({ event }: EventItemProps) {
  if ('request' in event) {
    const { request } = event;
    return (
      <EventCard>
        <label>Request</label>
        <div>
          <label>ID:</label> {request.requestId.toString()}
        </div>
        <div>
          <label>Caller:</label> {request.caller.toString()}
        </div>
        <div>
          <label>Time:</label> {new Date(Number(request.time) / 1e6).toString()}
        </div>
      </EventCard>
    );
  }

  // Default
  return <EventCard tw="opacity-60">Unknown event type</EventCard>;
}

const StyledEventItem = styled(EventItem)`
  /* TODO: custom CSS */

  label {
    font-weight: bold;
  }
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
          <StyledEventItem key={i} event={event} />
        ))}
      </div>
    </>
  );
}
