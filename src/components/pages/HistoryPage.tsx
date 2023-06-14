import { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { backend } from '../../declarations/backend';
import { Event } from '../../declarations/backend/backend.did';
import useIdentity from '../../hooks/useIdentity';
import { handleError } from '../../utils/handlers';
import { unwrap } from '../../utils/unwrap';
import Loading from '../Loading';

interface EventItemProps {
  event: Event;
}

// Convert agent-js response value to JSON
const show = (value: any): string => {
  const cache: any[] = [];
  return JSON.stringify(value, (k, v) => {
    if (typeof v === 'object' && v !== null) {
      if (cache.includes(v)) return;
      cache.push(v);
    }
    if (v === undefined || v === null) return null;
    if (typeof v === 'bigint') return v.toString();
    if (ArrayBuffer.isView(v) || v instanceof ArrayBuffer)
      return [...(v as any)];
    return v;
  });
};

function EventItem({ event }: EventItemProps) {
  if ('install' in event) {
    const { install } = event;
    return (
      <InstallEventCard>
        <label tw="text-lg text-blue-500">Install</label>
        <div>
          <label>Installer:</label> {install.installer.toString()}
        </div>
        <div>
          <label>Time:</label> {new Date(Number(install.time) / 1e6).toString()}
        </div>
      </InstallEventCard>
    );
  } else if ('request' in event) {
    const { request } = event;
    return (
      <RequestEventCard>
        <div tw="float-right">{request.requestId.toString()}</div>
        <label tw="text-lg text-blue-900">{show(request.request)} </label>
        <div>
          <label>Caller:</label> {request.caller.toString()}
        </div>
        <div>
          <label>Time:</label> {new Date(Number(request.time) / 1e6).toString()}
        </div>
      </RequestEventCard>
    );
  } else if ('internal' in event) {
    const { internal } = event;
    return (
      <InternalEventCard>
        <div tw="float-right">{internal.requestId.toString()}</div>
        <label tw="text-lg text-blue-500">{show(internal.internal)} </label>
      </InternalEventCard>
    );
  } else if ('response' in event) {
    const { response } = event;
    return (
      <ResponseEventCard>
        <div tw="float-right">{response.requestId.toString()}</div>
        <label tw="text-lg text-blue-500">{show(response.response)} </label>
      </ResponseEventCard>
    );
  }

  // Default
  return (
    <UnknownEventCard tw="opacity-60">Unknown event type</UnknownEventCard>
  );
}

const UnknownEventCard = styled.div`
  ${tw`bg-gray-100 px-5 py-3 rounded-xl my-2`}

  label {
    font-weight: bold;
  }
`;

const InstallEventCard = styled.div`
  ${tw`bg-blue-100 px-5 py-3 rounded-xl my-2`}

  label {
    font-weight: bold;
  }
`;

const RequestEventCard = styled.div`
  ${tw`bg-purple-200 px-5 py-3 rounded-t-xl mt-2`}

  label {
    font-weight: bold;
  }
`;

const InternalEventCard = styled.div`
  ${tw`bg-white px-5 py-3`}

  label {
    color: black;
  }
`;

const ResponseEventCard = styled.div`
  ${tw`bg-green-200 px-5 py-3 rounded-b-xl mb-2`}

  label {
    color: green;
    font-weight: bold;
  }
`;

const maxEventCount = 1000; // TODO: pagination

export default function HistoryPage() {
  const [events, setEvents] = useState<Event[] | undefined>();

  const user = useIdentity();

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const events = unwrap(
            await backend.getLogEvents(BigInt(0), BigInt(maxEventCount)),
          );
          console.log('Events:', events);
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
      <div tw="flex flex-col mx-auto">
        {events.map((event, i) => (
          <EventItem key={i} event={event} />
        ))}
      </div>
    </>
  );
}
