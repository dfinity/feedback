import ReactMarkdown from 'react-markdown';
import tw from 'twin.macro';

const ProseReactMarkdown = tw(
  ReactMarkdown,
)`prose [&>*]:my-0 [& a]:text-blue-500`;

export interface MarkdownViewProps {
  children: string;
}

export default function Markdown({ children }: MarkdownViewProps) {
  return (
    <ProseReactMarkdown linkTarget="_blank">{children}</ProseReactMarkdown>
  );
}
