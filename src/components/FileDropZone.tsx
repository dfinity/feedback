import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { useTopicStore } from '../stores/topicStore';
import { handleError, handlePromise } from '../utils/handlers';
import parseJiraXml from '../utils/parseJiraXml';

const ContainerDiv = styled.div`
  ${(p: { isDragActive: boolean }) => [
    tw`w-screen h-screen`,
    p.isDragActive && tw`bg-[#fff5]`,
  ]}
`;

export interface FileDropZoneProps {
  children: any; // TODO
}

export function FileDropZone({ children }: FileDropZoneProps) {
  const onDrop = useCallback((files: File[]) => {
    files.forEach((file) => {
      if (file.type === 'text/xml') {
        const reader = new FileReader();
        reader.onerror = (event) => {
          console.error(event);
          handleError('Error while reading file!');
        };
        reader.onload = () => {
          try {
            const infoArray = parseJiraXml(reader.result as string);
            if (
              !window.confirm(
                `Import ${infoArray.length} topic${
                  infoArray.length === 1 ? '' : 's'
                } from Jira?`,
              )
            ) {
              return;
            }
            console.log('Importing from Jira XML file:', infoArray);
            handlePromise(
              useTopicStore.getState().bulkCreate(infoArray),
              `Importing topic${
                infoArray.length === 1 ? '' : 's'
              } from Jira...`,
              'Error while importing from Jira!',
            );
          } catch (err) {
            handleError(err, 'Error while parsing XML!');
          }
        };
        reader.readAsText(file);
      }
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    onDrop,
  });

  return (
    <ContainerDiv
      {...getRootProps({
        isDragActive,
        style: { transition: '.2s background-color ease-out' },
      })}
    >
      {children}
      <input {...getInputProps({ style: { display: 'none' } })} />
    </ContainerDiv>
  );
}
