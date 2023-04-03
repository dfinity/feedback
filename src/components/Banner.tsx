import { FaTimes } from 'react-icons/fa';
import tw, { TwStyle } from 'twin.macro';
import { BannerType, useBannerStore } from '../stores/bannerStore';

const bannerStyles: Record<BannerType, TwStyle> = {
  info: tw`bg-teal-500 text-white`,
  warning: tw`bg-yellow-400`,
  error: tw`bg-red-500 text-white`,
};

export function Banner() {
  const banner = useBannerStore((state) => state.banner);

  if (!banner) {
    return null;
  }

  return (
    <div
      tw="flex items-center fixed z-50 opacity-90 top-5 right-5 ml-5 min-w-[300px] rounded-xl mx-5 px-5 py-3"
      css={bannerStyles[banner.type]}
    >
      <div tw="flex-1">{banner.message}</div>
      <div
        tw="cursor-pointer hover:opacity-75 active:opacity-60 p-3"
        onClick={() => useBannerStore.setState({ banner: null })}
      >
        <FaTimes />
      </div>
    </div>
  );
}
