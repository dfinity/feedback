import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { TopicInfo, useTopicStore } from '../stores/topicStore';

const Form = styled.form`
  ${tw`w-full flex flex-col gap-3`}

  label {
    ${tw`flex flex-col gap-1 w-full text-xl font-semibold`}
    > * {
      ${tw`text-lg font-normal`}
    }
  }

  input[type='text'],
  textarea {
    ${tw`w-full border-2 p-2 rounded-lg`}
  }
`;

export interface TopicFormProps {
  initial?: TopicInfo;
  onSubmit?(info: TopicInfo): void | Promise<void>;
}

export default function TopicForm({ initial, onSubmit }: TopicFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState(
    () =>
      initial || {
        title: '',
        description: '',
        links: [],
        tags: [],
      },
  );
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm();

  const tags = useTopicStore((state) => state.tags);

  const isValid = () => {
    return info.title.length > 1;
  };

  const patch = (partialInfo: Partial<TopicInfo>) =>
    setInfo({ ...info, ...partialInfo });

  // TODO: add client-side form validation

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        if (!submitting && isValid()) {
          const promise = onSubmit?.(info);
          if (promise) {
            setSubmitting(true);
            promise.finally(() => setSubmitting(false));
          }
        }
      }}
    >
      <label>
        Title
        <input
          type="text"
          value={info.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </label>
      <label>
        Brief description
        <textarea
          tw="mb-0"
          rows={5}
          value={info.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </label>
      {/* {!!info.description && (
        <div tw="p-3 border-2 rounded-xl">
          <Markdown>{info.description}</Markdown>
        </div>
      )} */}
      <label>
        Links
        <div tw="flex flex-col gap-2">
          {[...info.links, ''].map((link, i) => (
            <div key={i}>
              <input
                type="text"
                placeholder="Paste URL here"
                value={link}
                onChange={(e) => {
                  const newLink = e.target.value;
                  const newLinks = [...info.links];
                  if (newLink) {
                    newLinks[i] = newLink;
                  } else {
                    newLinks.splice(i, 1);
                  }
                  patch({
                    links: newLinks,
                  });
                }}
              />
            </div>
          ))}
        </div>
      </label>
      <label>
        Tags
        <div tw="flex flex-col gap-2">
          <CreatableSelect
            tw="w-full"
            styles={{
              // multiValue: (styles) => ({
              //   ...styles,
              // }),
              container: (styles) => ({
                ...styles,
                borderRadius: '100%',
              }),
              placeholder: (styles) => ({
                ...styles,
                color: '#0005',
              }),
            }}
            value={info.tags.map((tag) => ({ label: tag, value: tag }))}
            isMulti={true}
            options={tags.map((tag) => ({
              label: tag.name,
              value: tag.name,
            }))}
            onChange={(newTags) => {
              patch({
                tags: newTags.map((tag) => tag.value),
              });
            }}
          />
        </div>
      </label>
      <button
        tw="mt-5 w-full px-8 py-3 border-2 bg-[#fff8] border-primary text-primary hover:bg-primary hover:text-white font-bold text-xl rounded-xl"
        type="submit"
      >
        {initial ? 'Save Changes' : 'Submit'}
      </button>
    </Form>
  );
}
