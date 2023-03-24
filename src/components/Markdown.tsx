import ReactMarkdown from 'react-markdown';
import tw from 'twin.macro';

const ProseReactMarkdown = tw(ReactMarkdown)`prose [&>*]:my-0`;

export interface MarkdownViewProps {
  children: string;
}

export default function Markdown({ children }: MarkdownViewProps) {
  return <ProseReactMarkdown>{children}</ProseReactMarkdown>;
}
