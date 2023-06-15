import { useCallback, useEffect, useMemo, useState } from 'react';
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

const eventsPerPage = 1000;

export default function HistoryPage() {
  const [pageCount, setPageCount] = useState(1);
  const [fetchedPageCount, setFetchedPageCount] = useState(0);
  const [maxPages, setMaxPages] = useState(0);
  const [eventGroups, setEventGroups] = useState<Event[][]>([]);

  const user = useIdentity();

  // Cache initial event count
  const eventCountPromise = useMemo(
    async () => Number(unwrap(await backend.getLogEventCount())),
    [],
  );

  const getRequestId = useCallback((event: Event): string | undefined => {
    const part = (event as any)[Object.keys(event)[0]];
    return part.requestId ? String(part.requestId) : undefined;
  }, []);

  useEffect(() => {
    if (!user || fetchedPageCount >= pageCount) {
      return;
    }
    (async () => {
      try {
        const eventCount = await eventCountPromise;
        setFetchedPageCount(pageCount);
        setMaxPages(Math.ceil(eventCount / eventsPerPage));

        const minEventNumber =
          BigInt(eventCount) - BigInt(pageCount * eventsPerPage);
        const events = unwrap(
          await backend.getLogEvents(
            minEventNumber < BigInt(0) ? BigInt(0) : minEventNumber,
            BigInt((pageCount - fetchedPageCount) * eventsPerPage),
          ),
        ).reverse();

        const groups: Event[][] = [...eventGroups];
        console.log('Events:', events);
        events.forEach((event) => {
          const requestId = getRequestId(event);
          if (groups.length && requestId) {
            const previousGroup = groups[groups.length - 1];
            const previousRequestId = getRequestId(previousGroup[0]);
            if (requestId === previousRequestId) {
              // Add to most recent group
              previousGroup.unshift(event);
              return;
            }
          }
          // Create a new group by default
          groups.push([event]);
        });
        setEventGroups(groups);
      } catch (err) {
        handleError(err, 'Error while fetching history!');
      }
    })();
  }, [
    eventCountPromise,
    eventGroups,
    fetchedPageCount,
    getRequestId,
    pageCount,
    user,
  ]);

  const events = useMemo(() => {
    const events: Event[] = [];
    // Hide earliest (possibly incomplete) group
    (pageCount === maxPages ? eventGroups : eventGroups.slice(0, -1)).forEach(
      (group) => events.push(...group),
    );
    return events;
  }, [eventGroups, maxPages, pageCount]);

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
        {pageCount < maxPages && (
          <div
            tw="mt-3 p-3 text-lg bg-[#FFF2] text-white cursor-pointer select-none border-primary text-center rounded"
            onClick={() => setPageCount(pageCount + 1)}
          >
            Load More
          </div>
        )}
      </div>
    </>
  );
}
