import { create } from 'zustand';
import { Principal } from '@dfinity/principal';

export type FeedbackStatus = 'open' | 'completed' | 'closed';
export interface FeedbackItem {
  id: string;
  owner: Principal;
  name: string;
  description: string;
  links: string[];
  votes: number;
  status: FeedbackStatus;
}

export interface FeedbackState {
  items: FeedbackItem[];
  loading: boolean;
  nextId: number; // temp
}

export const useFeedbackStore = create<FeedbackState>((set) => {
  const updateItem = (item: FeedbackItem) =>
    set((state) => ({
      ...state,
      items: [...state.items.filter((other) => item.id !== other.id)],
    }));

  return {
    // items: [],
    items: [
      {
        id: '0000',
        name: 'Example item',
        description: 'Example description',
        links: [],
        owner: Principal.anonymous(),
        votes: 0,
        status: 'open',
      },
      {
        id: '1111',
        name: 'Another example item',
        description: 'Another description',
        links: ['https://github.com/dfinity/feedback/issues/1'],
        owner: Principal.anonymous(),
        votes: 3,
        status: 'open',
      },
      {
        id: '2222',
        name: 'Completed item',
        description: 'Completed description',
        links: [],
        owner: Principal.anonymous(),
        votes: 5,
        status: 'completed',
      },
      {
        id: '3333',
        name: 'Closed item',
        description: 'Closed description',
        links: [],
        owner: Principal.anonymous(),
        votes: 0,
        status: 'closed',
      },
    ],
    loading: false,
    nextId: 0, // temp
    create: (name: string, description: string, links: string[]) =>
      set((state) => ({
        ...state,
        items: [
          ...state.items,
          {
            id: String(state.nextId++),
            name,
            description,
            links,
            owner: Principal.anonymous(),
            votes: 0,
            status: 'open',
          },
        ],
      })),
    submit: (item: FeedbackItem) => updateItem(item), // TODO: call backend
    edit: (item: FeedbackItem) => updateItem(item), // TODO: call backend
    upvote: (item: FeedbackItem) =>
      updateItem({ ...item, votes: item.votes + 1 }), // TODO: call backend
    downvote: (item: FeedbackItem) =>
      updateItem({ ...item, votes: item.votes + 1 }), // TODO: call backend
    changeStatus: (item: FeedbackItem, state: FeedbackStatus) =>
      updateItem({ ...item, status: state }), // TODO: call backend
  };
});
