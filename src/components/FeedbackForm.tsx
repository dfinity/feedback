import { useState } from 'react';
import { FeedbackItemDetails } from '../stores/feedbackStore';
import styled from 'styled-components/macro';
import tw from 'twin.macro';

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

  const patch = (partialDetails: Partial<FeedbackItemDetails>) =>
    setDetails({ ...details, ...partialDetails });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(details);
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
      <button
        className="w-full px-8 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-xl rounded-xl"
        type="submit"
      >
        {initial ? 'Save Changes' : 'Submit'}
      </button>
    </Form>
  );
}
