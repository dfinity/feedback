import { create } from 'zustand';
import { Principal } from '@dfinity/principal';

export type FeedbackStatus = 'open' | 'completed' | 'closed';
export interface FeedbackItem {
  id: string;
  owner: Principal;
  name: string;
  links: string[];
  votes: number;
  status: FeedbackStatus;
}

export interface FeedbackState {
  items: FeedbackItem[];
  loading: boolean;
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
        id: '000',
        name: 'Example item',
        links: [],
        owner: Principal.anonymous(),
        votes: 0,
        status: 'open',
      },
      {
        id: '111',
        name: 'Another example item',
        links: ['https://github.com/dfinity/feedback/issues/1'],
        owner: Principal.anonymous(),
        votes: 3,
        status: 'open',
      },
      {
        id: '222',
        name: 'Completed item',
        links: [],
        owner: Principal.anonymous(),
        votes: 5,
        status: 'completed',
      },
      {
        id: '222',
        name: 'Closed item',
        links: [],
        owner: Principal.anonymous(),
        votes: 0,
        status: 'closed',
      },
    ],
    loading: false,
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
