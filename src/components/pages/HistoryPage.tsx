import { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { backend } from '../../declarations/backend';
import { Event } from '../../declarations/backend/backend.did';
import useIdentity from '../../hooks/useIdentity';
import { handleError } from '../../utils/handlers';
import Loading from '../Loading';

interface EventItemProps {
  event: Event;
}

function EventItem({ event }: EventItemProps) {
  if ('request' in event) {
    const { request } = event;
    return (
      <EventCard>
        <label tw="text-lg text-blue-500">Request</label>
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

const EventCard = styled.div`
  ${tw`bg-gray-100 px-5 py-3 rounded-xl`}

  // TODO: custom CSS styling
  label {
    font-weight: bold;
  }
`;

export default function HistoryPage() {
  const [events, setEvents] = useState<Event[] | undefined>();
  const [maxEventCount] = useState(1000); // TODO: adjustable?

  const user = useIdentity();

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const eventCount = await backend.getLogEventCount();
          const minEventNumber = eventCount - BigInt(maxEventCount);
          const events = await backend.getLogEvents(
            minEventNumber < BigInt(0) ? BigInt(0) : minEventNumber,
            eventCount,
          );
          events.reverse(); // Most recent events first
          console.log('Events:', events);
          setEvents(events);
        } catch (err) {
          handleError(err, 'Error while fetching history!');
        }
      })();
    }
  }, [maxEventCount, user]);

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
          <EventItem key={i} event={event} />
        ))}
      </div>
    </>
  );
}
