import { ReactNode, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { FeedbackItemDetails } from '../stores/feedbackStore';
import Tooltip from './Tooltip';

const Form = styled.form`
  ${tw`w-full flex flex-col gap-3`}

  label {
    ${tw`block opacity-75 font-semibold`}
  }

  input[type='text'],
  textarea {
    ${tw`w-full border-2 p-2 rounded-lg`}
  }
`;

const ArrayEditorButton = tw.div`cursor-pointer inline-block p-2 text-sm rounded-full border-2 hover:bg-[rgba(0,0,0,.05)]`;

interface ArrayEditorProps<T> {
  array: T[];
  onChange(newArray: T[]): void;
  onCreate(): T;
  children(item: T, i: number): ReactNode;
  newTooltip?: ReactNode;
}

function ArrayEditor<T>({
  array: value,
  onChange,
  onCreate: createItem,
  children,
  newTooltip,
}: ArrayEditorProps<T>) {
  return (
    <div>
      {value.map((item, i) => (
        <div tw="flex">
          <ArrayEditorButton>
            <FaMinus />
          </ArrayEditorButton>
          <div tw="flex-1">{children(item, i)}</div>
        </div>
      ))}
      <Tooltip content={newTooltip}>
        <ArrayEditorButton onClick={() => onChange([...value, createItem()])}>
          <FaPlus />
        </ArrayEditorButton>
      </Tooltip>
    </div>
  );
}

export interface FeedbackFormProps {
  initial?: FeedbackItemDetails;
  onSubmit?(details: FeedbackItemDetails): void;
}

export default function FeedbackForm({ initial, onSubmit }: FeedbackFormProps) {
  const [details, setDetails] = useState(
    () =>
      initial || {
        title: '',
        description: '',
        links: [],
        tags: [],
      },
  );

  const isValid = () => {
    return details.title.length > 1;
  };

  const patch = (partialDetails: Partial<FeedbackItemDetails>) =>
    setDetails({ ...details, ...partialDetails });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid()) {
          onSubmit?.(details);
        }
      }}
    >
      <div>
        <label>Title</label>
        <input
          type="text"
          value={details.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </div>
      <div>
        <label>Brief description</label>
        <textarea
          value={details.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </div>
      <div>
        <label>Links</label>
        <ArrayEditor
          array={details.links}
          onChange={(links) => patch({ links })}
          onCreate={() => ''}
        >
          {(value, i) => (
            <input
              type="text"
              value={details.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          )}
        </ArrayEditor>
      </div>
      <button
        tw="w-full px-8 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-xl rounded-xl"
        type="submit"
      >
        {initial ? 'Save Changes' : 'Submit'}
      </button>
    </Form>
  );
}
