import { create } from 'zustand';
import { backend } from '../declarations/backend';
import { ImportId, Status, View } from '../declarations/backend/backend.did';
import { unwrap } from '../utils/unwrap';

// Dev console access
(window as any).BACKEND = backend;

export type TopicStatus = 'open' | 'next' | 'completed' | 'closed';
export type ModStatus = 'pending' | 'approved' | 'rejected';
export type VoteStatus = 1 | 0 | -1;
export type SearchSort = 'votes' | 'activity';

export const SEARCH_SORTS = ['activity', 'votes'];

export interface TopicInfo {
  title: string;
  description: string;
  links: string[];
  tags: string[];
}

export interface Topic extends TopicInfo {
  id: string;
  // owner: Principal;
  createTime: number;
  editTime: number;
  upvotes: number;
  downvotes: number;
  status: TopicStatus;
  modStatus: ModStatus;
  modMessage: string;
  isOwner: boolean;
  isEditable: boolean;
  yourVote: VoteStatus;
  importId?: { type: string; id: string } | undefined;
}

export interface ImportTopic extends TopicInfo {
  importId: ImportId;
  status: TopicStatus;
  createTime: number;
  editTime: number;
}

export interface TagInfo {
  name: string;
  count: number;
}

export interface TopicState {
  topicLookup: Record<string, Topic>;
  topics: Topic[];
  modQueue: Topic[] | undefined;
  sort: SearchSort;
  tags: TagInfo[];
  search(): Promise<Topic[]>;
  find(id: string): Promise<Topic | undefined>;
  create(info: TopicInfo): Promise<void>;
  importAll(infoArray: TopicInfo[]): Promise<void>;
  edit(id: string, info: TopicInfo): Promise<void>;
  vote(topic: Topic, vote: VoteStatus): Promise<void>;
  setStatus(id: string, status: TopicStatus): Promise<void>;
  fetchModQueue(): Promise<Topic[]>;
  setModStatus(
    topic: Topic,
    modStatus: ModStatus,
    modMessage?: string,
  ): Promise<void>;
}

export const useTopicStore = create<TopicState>((set, get) => {
  const updateTopic = (topic: Topic) =>
    set((state) => ({
      topicLookup: { ...state.topicLookup, [topic.id]: topic },
      topics: state.topics.map((other) =>
        topic.id === other.id ? topic : other,
      ),
      modQueue: state.modQueue
        ?.map((other) => (topic.id === other.id ? topic : other))
        .filter(
          (other) => topic.id !== other.id || other.modStatus !== 'approved',
        ),
    }));

  const statusMap: Record<TopicStatus, Status> = {
    open: { open: null },
    next: { next: null },
    completed: { completed: null },
    closed: { closed: null },
  };

  const mapImportId = (id: ImportId) => {
    const entry = Object.entries(id)[0];
    return (
      entry && {
        type: entry[0],
        id: entry[1],
      }
    );
  };

  // Converts nanoseconds and microseconds to milliseconds
  const resolveTime = (time: bigint): number => {
    const threshold = BigInt(100_000_000_000_000);
    const oneThousand = BigInt(1000);
    // ns -> us -> ms
    while (time > threshold) {
      time /= oneThousand;
    }
    // s -> ms
    if (time < threshold / oneThousand) {
      time *= oneThousand;
    }
    return Number(time);
  };

  const mapTopic = (result: View): Topic => ({
    ...result,
    id: String(result.id),
    createTime: resolveTime(result.createTime),
    editTime: resolveTime(result.editTime),
    tags: result.tags.map(normalizeTag),
    upvotes: Number(result.upVoters),
    downvotes: Number(result.downVoters),
    status: Object.keys(result.status)[0] as TopicStatus,
    modStatus: Object.keys(result.modStatus)[0] as ModStatus,
    modMessage:
      ('rejected' in result.modStatus && result.modStatus.rejected?.[0]) || '',
    yourVote: 'up' in result.yourVote ? 1 : 'down' in result.yourVote ? -1 : 0,
    importId: result.importId.length
      ? mapImportId(result.importId[0])
      : undefined,
  });

  const normalizeTag = (tag: string) => tag.toLowerCase();

  return {
    topicLookup: {},
    topics: [],
    modQueue: undefined,
    sort: 'activity',
    tags: [],
    async search() {
      const topics = (
        await backend.searchTopics({ [get().sort]: null } as any)
      ).map(mapTopic);
      const topicLookup = { ...get().topicLookup };
      const tagCounts: Record<string, number> = {};
      topics.forEach((topic) => {
        topicLookup[topic.id] = topic;
        topic.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      const tags = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      set({ topicLookup, topics, tags });
      // console.log('Topics:', get().topics);
      return topics;
    },
    async find(id: string) {
      const result = await backend.getTopic(BigInt(id));
      if (!result.length) {
        return;
      }
      return mapTopic(result[0]);
    },
    async create(info: TopicInfo) {
      const id = String(unwrap(await backend.createTopic(info)));
      const now = Date.now();
      const topic: Topic = {
        ...info,
        id,
        createTime: now,
        editTime: now,
        tags: info.tags.map(normalizeTag),
        upvotes: 1,
        downvotes: 0,
        yourVote: 1,
        status: 'open',
        modStatus: 'pending',
        modMessage: '',
        isOwner: true,
        isEditable: true,
      };
      set((state) => ({
        topics: [topic, ...state.topics],
      }));
    },
    async importAll(infoArray: ImportTopic[]) {
      unwrap(
        await backend.importTopics(
          infoArray.map((info) => ({
            ...info,
            status: { [info.status]: null } as Status,
            createTime: BigInt(info.createTime),
            editTime: BigInt(info.editTime),
          })),
        ),
      );
      await get().search();
    },
    async edit(id: string, info: TopicInfo) {
      const topic = get().topics.find((topic) => topic.id === id);
      if (topic) {
        updateTopic({
          ...topic,
          ...info,
          modStatus:
            topic.modStatus === 'rejected' ? 'pending' : topic.modStatus,
        });
      }
      unwrap(await backend.editTopic(BigInt(id), info));
    },
    async vote(topic: Topic, vote: VoteStatus) {
      updateTopic({
        ...topic,
        upvotes:
          topic.upvotes + Math.max(0, vote) - Math.max(0, topic.yourVote),
        downvotes:
          topic.downvotes - Math.min(0, vote) + Math.min(0, topic.yourVote),
        yourVote: vote,
      });
      unwrap(
        await backend.voteTopic(
          BigInt(topic.id),
          vote === 1
            ? { up: null }
            : vote === -1
            ? { down: null }
            : { none: null },
        ),
      );
    },
    async setStatus(id: string, status: TopicStatus) {
      const topic = get().topics.find((topic) => topic.id === id);
      if (topic) {
        updateTopic({ ...topic, status });
      }
      unwrap(await backend.setTopicStatus(BigInt(id), statusMap[status]));
    },
    async fetchModQueue() {
      const topics = unwrap(await backend.getModeratorTopics()).map(mapTopic);
      console.log('Queue:', topics);
      set({ modQueue: topics });
      return topics;
    },
    async setModStatus(
      topic: Topic,
      modStatus: ModStatus,
      modMessage?: string,
    ) {
      updateTopic({
        ...topic,
        modStatus,
        modMessage: modMessage || '',
      });
      unwrap(
        await backend.setTopicModStatus(BigInt(topic.id), {
          [modStatus]:
            modStatus === 'rejected' ? (modMessage ? [modMessage] : []) : null,
        } as any),
      );
    },
  };
});
