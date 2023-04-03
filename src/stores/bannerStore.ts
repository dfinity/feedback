import { create } from 'zustand';

export type BannerType = 'info' | 'warning' | 'error';

export interface BannerModel {
  type: BannerType;
  message: string;
}

export interface BannerState {
  banner: BannerModel | null;
}

export const useBannerStore = create<BannerState>((set, get) => {
  return {
    banner: null,
  };
});

export function setErrorBanner(err: Error | string) {
  useBannerStore.setState({
    banner: {
      type: 'error',
      message: typeof err === 'string' ? err : err.message,
    },
  });
}
