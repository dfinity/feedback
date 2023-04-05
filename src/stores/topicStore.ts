import { create } from 'zustand';
import { backend } from '../declarations/backend';
import { Status } from '../declarations/backend/backend.did';

export type TopicStatus = 'open' | 'next' | 'completed' | 'closed';
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
  owned: boolean;
  yourVote: VoteStatus;
}

export interface TopicState {
  topics: Topic[];
  loading: boolean;
  fetch(): Promise<Topic[]>;
  create(info: TopicInfo): Promise<void>;
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

  return {
    // topics: [
    //   {
    //     id: '0000',
    //     title: 'Example request',
    //     description: 'Example description',
    //     links: [],
    //     tags: ['Motoko', 'Syntax'],
    //     owner: Principal.anonymous(),
    //     createTime: Date.now(),
    //     votes: 0,
    //     status: 'open',
    //     owned: true,
    //     yourVote: 0,
    //   },
    //   {
    //     id: '1111',
    //     title: 'Another example',
    //     description: '## Markdown description\n\n\n\n> Quoted text',
    //     links: ['https://github.com/dfinity/feedback/issues/1'],
    //     tags: ['Docs', 'Stable Memory', 'Rust', 'P1'],
    //     owner: Principal.anonymous(),
    //     createTime: Date.now(),
    //     votes: 3,
    //     status: 'open',
    //     owned: true,
    //     yourVote: 1,
    //   },
    //   {
    //     id: '2222',
    //     title: 'Feature in progress',
    //     description: 'In-progress description',
    //     links: [],
    //     tags: ['Agent-JS', 'P0', 'Feature'],
    //     owner: Principal.anonymous(),
    //     createTime: Date.now(),
    //     votes: 5,
    //     status: 'next',
    //     owned: true,
    //     yourVote: 1,
    //   },
    //   {
    //     id: '3333',
    //     title: 'Completed feature',
    //     description: 'Completed description',
    //     links: [],
    //     tags: ['DFX', 'Config'],
    //     owner: Principal.anonymous(),
    //     createTime: Date.now(),
    //     votes: 5,
    //     status: 'completed',
    //     owned: true,
    //     yourVote: 0,
    //   },
    //   {
    //     id: '4444',
    //     title: 'Closed topic',
    //     description: 'Closed description',
    //     links: [],
    //     tags: [],
    //     owner: Principal.anonymous(),
    //     createTime: Date.now(),
    //     votes: 0,
    //     status: 'closed',
    //     owned: true,
    //     yourVote: 0,
    //   },
    // ],
    topics: [],
    loading: false,
    async fetch() {
      const results = await backend.fetch();
      const topics: Topic[] = results.map((result) => ({
        ...result,
        id: String(result.id),
        createTime: Number(result.createTime),
        votes: result.upVoters.length - result.downVoters.length,
        status: Object.keys(result.status)[0] as TopicStatus,
        owned: true, // TODO
        yourVote: result.upVoters.length
          ? 1
          : result.downVoters.length
          ? -1
          : 0, // TODO
      }));
      set({ topics });
      console.log(topics); ///
      return topics;
    },
    async create(info: TopicInfo) {
      const id = String(await backend.create(info));
      const topic: Topic = {
        ...info,
        id,
        createTime: Date.now(),
        votes: 0,
        status: 'open',
        owned: true,
        yourVote: 0,
      };
      set((state) => ({
        topics: [topic, ...state.topics],
      }));
      // await get().fetch();
    },
    async edit(id: string, info: TopicInfo) {
      const topic = get().topics.find((topic) => topic.id === id);
      if (topic) {
        updateTopic({ ...topic, ...info });
      }
      await backend.edit(BigInt(id), info);
    },
    async vote(topic: Topic, vote: VoteStatus) {
      updateTopic({
        ...topic,
        votes: topic.votes + vote - topic.yourVote,
        yourVote: vote,
      });
      await backend.vote(
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
      backend.changeStatus(BigInt(id), statusMap[status]);
    },
  };
});
