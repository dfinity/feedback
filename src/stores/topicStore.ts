import { create } from 'zustand';
import { Principal } from '@dfinity/principal';

export type TopicStatus = 'open' | 'active' | 'completed' | 'closed';
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
  yourVote: VoteStatus;
  status: TopicStatus;
}

export interface TopicState {
  requests: Topic[];
  loading: boolean;
  create(info: TopicInfo): Promise<void>;
  edit(topic: Topic): Promise<void>; // backend could use `edit(id: Nat, info: TopicInfo)`
  vote(topic: Topic, vote: VoteStatus): Promise<void>;
  changeStatus(topic: Topic, state: TopicStatus): Promise<void>;
}

export const useTopicStore = create<TopicState>((set, get) => {
  const updateTopic = (topic: Topic) =>
    set((state) => ({
      requests: state.requests.map((other) =>
        topic.id === other.id ? topic : other,
      ),
    }));

  let nextId = 0; // temp

  return {
    requests: [
      {
        id: '0000',
        title: 'Example topic',
        description: 'Example description',
        links: [],
        tags: ['Motoko', 'Syntax'],
        owner: Principal.anonymous(),
        createTime: new Date(),
        votes: 0,
        yourVote: 0,
        status: 'open',
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
        yourVote: 1,
        status: 'open',
      },
      {
        id: '2222',
        title: 'Feature in progress',
        description: 'Active description',
        links: [],
        tags: ['Agent-JS', 'P0', 'Feature'],
        owner: Principal.anonymous(),
        createTime: new Date(),
        votes: 5,
        yourVote: 1,
        status: 'active',
      },
      {
        id: '3333',
        title: 'Completed topic',
        description: 'Completed description',
        links: [],
        tags: ['DFX', 'Config'],
        owner: Principal.anonymous(),
        createTime: new Date(),
        votes: 5,
        yourVote: 0,
        status: 'completed',
      },
      {
        id: '4444',
        title: 'Closed item',
        description: 'Closed description',
        links: [],
        tags: [],
        owner: Principal.anonymous(),
        createTime: new Date(),
        votes: 0,
        yourVote: 0,
        status: 'closed',
      },
    ],
    loading: false,
    async create(info: TopicInfo) {
      set((state) => ({
        requests: [
          ...state.requests,
          {
            ...info,
            id: String(nextId++),
            owner: Principal.anonymous(),
            createTime: new Date(),
            votes: 0,
            yourVote: 0,
            status: 'open',
          },
        ],
      }));
      // TODO: call backend
    },
    async edit(topic: Topic) {
      updateTopic(topic);
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
