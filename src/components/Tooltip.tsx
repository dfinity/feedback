import Tippy, { TippyProps } from '@tippyjs/react';

export interface TooltipProps extends TippyProps {}

export default function Tooltip({
  duration,
  hideOnClick,
  ...others
}: TooltipProps) {
  return (
    <Tippy
      duration={duration ?? 100}
      hideOnClick={hideOnClick ?? true}
      {...others}
    ></Tippy>
  );
}
