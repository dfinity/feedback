import { create } from 'zustand';
import { Principal } from '@dfinity/principal';

export interface FeedbackItem {
  id: string;
  owner: Principal;
  name: string;
  links: string[];
}

export interface FeedbackState {
  items: FeedbackItem[];
}

export const useFeedbackStore = create<FeedbackState>((set) => {
  const updateItem = (item: FeedbackItem) =>
    set((state) => ({
      ...state,
      items: [...state.items.filter((other) => item.id !== other.id)],
    }));

  return {
    items: [],
    submit: (item: FeedbackItem) => updateItem(item), // TODO: call backend
    edit: (item: FeedbackItem) => updateItem(item), // TODO: call backend
  };
});
