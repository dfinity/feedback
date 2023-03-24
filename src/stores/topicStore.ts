import { create } from 'zustand';
import { Principal } from '@dfinity/principal';

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
  owner: Principal;
  createTime: Date;
  votes: number;
  status: TopicStatus;
  owned: boolean;
  yourVote: VoteStatus;
}

export interface TopicState {
  topics: Topic[];
  loading: boolean;
  create(info: TopicInfo): Promise<void>;
  edit(id: string, info: TopicInfo): Promise<void>;
  vote(topic: Topic, vote: VoteStatus): Promise<void>;
  changeStatus(topic: Topic, state: TopicStatus): Promise<void>;
}

export const useTopicStore = create<TopicState>((set, get) => {
  const updateTopic = (topic: Topic) =>
    set((state) => ({
      topics: state.topics.map((other) =>
        topic.id === other.id ? topic : other,
      ),
    }));

  let nextId = 0; // temp

  return {
    topics: [
      {
        id: '0000',
        title: 'Example request',
        description: 'Example description',
        links: [],
        tags: ['Motoko', 'Syntax'],
        owner: Principal.anonymous(),
        createTime: new Date(),
        votes: 0,
        status: 'open',
        owned: true,
        yourVote: 0,
      },
      {
        id: '1111',
        title: 'Another example',
        description: '## Markdown description\n\n\n\n> Quoted text',
        links: ['https://github.com/dfinity/feedback/issues/1'],
        tags: ['Docs', 'Stable Memory', 'Rust', 'P1'],
        owner: Principal.anonymous(),
        createTime: new Date(),
        votes: 3,
        status: 'open',
        owned: true,
        yourVote: 1,
      },
      {
        id: '2222',
        title: 'Feature in progress',
        description: 'In-progress description',
        links: [],
        tags: ['Agent-JS', 'P0', 'Feature'],
        owner: Principal.anonymous(),
        createTime: new Date(),
        votes: 5,
        status: 'next',
        owned: true,
        yourVote: 1,
      },
      {
        id: '3333',
        title: 'Completed feature',
        description: 'Completed description',
        links: [],
        tags: ['DFX', 'Config'],
        owner: Principal.anonymous(),
        createTime: new Date(),
        votes: 5,
        status: 'completed',
        owned: true,
        yourVote: 0,
      },
      {
        id: '4444',
        title: 'Closed topic',
        description: 'Closed description',
        links: [],
        tags: [],
        owner: Principal.anonymous(),
        createTime: new Date(),
        votes: 0,
        status: 'closed',
        owned: true,
        yourVote: 0,
      },
    ],
    loading: false,
    async create(info: TopicInfo) {
      set((state) => ({
        topics: [
          ...state.topics,
          {
            ...info,
            id: String(nextId++),
            owner: Principal.anonymous(),
            createTime: new Date(),
            votes: 0,
            status: 'open',
            owned: true,
            yourVote: 0,
          },
        ],
      }));
      // TODO: call backend
    },
    async edit(id: string, info: TopicInfo) {
      const topic = get().topics.find((topic) => topic.id === id);
      if (topic) {
        updateTopic({ ...topic, ...info });
      }
      // TODO: call backend
    },
    async vote(topic: Topic, vote: VoteStatus) {
      updateTopic({
        ...topic,
        votes: topic.votes + vote - topic.yourVote,
        yourVote: vote,
      });
      // TODO: call backend
    },
    async changeStatus(topic: Topic, state: TopicStatus) {
      updateTopic({ ...topic, status: state });
      // TODO: call backend
    },
  };
});
