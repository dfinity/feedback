import { create } from 'zustand';
import { Principal } from '@dfinity/principal';

export type FeedbackStatus = 'open' | 'active' | 'completed' | 'closed';
export type VoteStatus = 1 | 0 | -1;

export interface FeedbackItemDetails {
  name: string;
  description: string;
  links: string[];
  tags: string[];
}

export interface FeedbackItem extends FeedbackItemDetails {
  id: string;
  owner: Principal;
  votes: number;
  yourVote: VoteStatus;
  status: FeedbackStatus;
}

export interface FeedbackState {
  items: FeedbackItem[];
  loading: boolean;
  create(details: FeedbackItemDetails): Promise<void>;
  edit(item: FeedbackItem): Promise<void>; // backend could use `edit(id: Nat, details: FeedbackItemDetails)`
  vote(item: FeedbackItem, vote: VoteStatus): Promise<void>;
  changeStatus(item: FeedbackItem, state: FeedbackStatus): Promise<void>;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => {
  const updateItem = (item: FeedbackItem) =>
    set((state) => ({
      items: state.items.map((other) => (item.id === other.id ? item : other)),
    }));

  let nextId = 0; // temp

  return {
    items: [
      {
        id: '0000',
        name: 'Example item',
        description: 'Example description',
        links: [],
        tags: ['Motoko', 'Syntax'],
        owner: Principal.anonymous(),
        votes: 0,
        yourVote: 0,
        status: 'open',
      },
      {
        id: '1111',
        name: 'Another example item',
        description: 'Another description',
        links: ['https://github.com/dfinity/feedback/issues/1'],
        tags: ['Bug'],
        owner: Principal.anonymous(),
        votes: 3,
        yourVote: 1,
        status: 'open',
      },
      {
        id: '2222',
        name: 'Item in progress',
        description: 'Active description',
        links: [],
        tags: ['Feature', 'P0', 'T3'],
        owner: Principal.anonymous(),
        votes: 5,
        yourVote: 1,
        status: 'active',
      },
      {
        id: '3333',
        name: 'Completed item',
        description: 'Completed description',
        links: [],
        tags: ['SDK'],
        owner: Principal.anonymous(),
        votes: 5,
        yourVote: 0,
        status: 'completed',
      },
      {
        id: '4444',
        name: 'Closed item',
        description: 'Closed description',
        links: [],
        tags: [],
        owner: Principal.anonymous(),
        votes: 0,
        yourVote: 0,
        status: 'closed',
      },
    ],
    loading: false,
    async create(details: FeedbackItemDetails) {
      set((state) => ({
        items: [
          ...state.items,
          {
            ...details,
            id: String(nextId++),
            owner: Principal.anonymous(),
            votes: 0,
            yourVote: 0,
            status: 'open',
          },
        ],
      }));
      // TODO: call backend
    },
    async edit(item: FeedbackItem) {
      updateItem(item);
      // TODO: call backend
    },
    async vote(item: FeedbackItem, vote: VoteStatus) {
      updateItem({
        ...item,
        votes: item.votes + vote - item.yourVote,
        yourVote: vote,
      });
      // TODO: call backend
    },
    async changeStatus(item: FeedbackItem, state: FeedbackStatus) {
      updateItem({ ...item, status: state });
      // TODO: call backend
    },
  };
});
