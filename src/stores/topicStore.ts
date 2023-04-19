import { create } from 'zustand';
import { backend } from '../declarations/backend';
import { ImportId, Status } from '../declarations/backend/backend.did';
import { View } from '../../.dfx/local/canisters/backend/backend.did';

export type TopicStatus = 'open' | 'next' | 'completed' | 'closed';
export type ModStatus = 'pending' | 'approved' | 'spam';
export type VoteStatus = 1 | 0 | -1;

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

export interface TopicState {
  topics: Topic[];
  loading: boolean;
  search(): Promise<Topic[]>;
  find(id: string): Promise<Topic | undefined>;
  create(info: TopicInfo): Promise<void>;
  bulkCreate(infoArray: TopicInfo[]): Promise<void>;
  edit(id: string, info: TopicInfo): Promise<void>;
  vote(topic: Topic, vote: VoteStatus): Promise<void>;
  changeStatus(id: string, status: TopicStatus): Promise<void>;
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
    modStatus: Object.keys(result.status)[0] as ModStatus,
    yourVote: 'up' in result.yourVote ? 1 : 'down' in result.yourVote ? -1 : 0,
    importId: result.importId.length
      ? mapImportId(result.importId[0])
      : undefined,
  });

  return {
    topics: [],
    loading: false,
    async search() {
      const results = await backend.listTopics();
      const topics: Topic[] = results.map(mapTopic);
      set({ topics });
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
      const id = String(await backend.createTopic(info));
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
      // await get().fetch();
    },
    async bulkCreate(infoArray: (TopicInfo & { importId: ImportId })[]) {
      await backend.bulkCreateTopics(infoArray);
      await get().search();
    },
    async edit(id: string, info: TopicInfo) {
      const topic = get().topics.find((topic) => topic.id === id);
      if (topic) {
        updateTopic({ ...topic, ...info });
      }
      await backend.editTopic(BigInt(id), info);
    },
    async vote(topic: Topic, vote: VoteStatus) {
      updateTopic({
        ...topic,
        votes: topic.votes + vote - topic.yourVote,
        yourVote: vote,
      });
      await backend.voteTopic(
        BigInt(topic.id),
        vote === 1
          ? { up: null }
          : vote === -1
          ? { down: null }
          : { none: null },
      );
    },
    async changeStatus(id: string, status: TopicStatus) {
      const topic = get().topics.find((topic) => topic.id === id);
      if (topic) {
        updateTopic({ ...topic, status });
      }
      backend.setTopicStatus(BigInt(id), statusMap[status]);
    },
  };
});
