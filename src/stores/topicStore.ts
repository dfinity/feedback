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
  votes: number;
  status: TopicStatus;
  modStatus: ModStatus;
  isOwner: boolean;
  yourVote: VoteStatus;
  importId?: { type: string; id: string } | undefined;
}

export interface ImportTopic extends TopicInfo {
  importId: ImportId;
  status: TopicStatus;
  createTime: number;
  editTime: number;
}

export interface TopicState {
  topics: Topic[];
  sort: SearchSort;
  search(): Promise<Topic[]>;
  find(id: string): Promise<Topic | undefined>;
  create(info: TopicInfo): Promise<void>;
  importAll(infoArray: TopicInfo[]): Promise<void>;
  edit(id: string, info: TopicInfo): Promise<void>;
  vote(topic: Topic, vote: VoteStatus): Promise<void>;
  setStatus(id: string, status: TopicStatus): Promise<void>;
  getModQueue(): Promise<Topic[]>;
  setModStatus(topic: Topic, modStatus: ModStatus): Promise<void>;
}

export const useTopicStore = create<TopicState>((set, get) => {
  const updateTopic = (topic: Topic) =>
    set((state) => ({
      topics: state.topics.map((other) =>
        topic.id === other.id ? topic : other,
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

  const mapTopic = (result: View): Topic => ({
    ...result,
    id: String(result.id),
    createTime: Number(result.createTime),
    votes: Number(result.upVoters - result.downVoters),
    status: Object.keys(result.status)[0] as TopicStatus,
    modStatus: Object.keys(result.modStatus)[0] as ModStatus,
    yourVote: 'up' in result.yourVote ? 1 : 'down' in result.yourVote ? -1 : 0,
    importId: result.importId.length
      ? mapImportId(result.importId[0])
      : undefined,
  });

  return {
    topics: [],
    sort: 'activity',
    async search() {
      const topics = (
        await backend.searchTopics({ [get().sort]: null } as any)
      ).map(mapTopic);
      set({ topics });
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
      const topic: Topic = {
        ...info,
        id,
        createTime: Date.now(),
        votes: 0,
        status: 'open',
        modStatus: 'pending',
        isOwner: true,
        yourVote: 0,
      };
      set((state) => ({
        topics: [topic, ...state.topics],
      }));
      // await get().search();
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
        votes: topic.votes + vote - topic.yourVote,
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
    async getModQueue() {
      const topics = unwrap(await backend.getModeratorTopics()).map(mapTopic);
      console.log('Queue:', topics);
      return topics;
    },
    async setModStatus(topic: Topic, modStatus: ModStatus) {
      updateTopic({
        ...topic,
        modStatus,
      });
      unwrap(
        await backend.setTopicModStatus(BigInt(topic.id), {
          [modStatus]: null,
        } as any),
      );
    },
  };
});
