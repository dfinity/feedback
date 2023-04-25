import Turndown from 'turndown';
import { ImportTopic, TopicStatus } from '../stores/topicStore';

const turndown = new Turndown();

function htmlDecode(escaped: string): string {
  var e = document.createElement('textarea');
  e.innerHTML = escaped;
  return e.childNodes[0]?.nodeValue ?? '';
}

function htmlToMarkdown(html: string): string {
  return turndown.turndown(html);
}

export default function parseJiraXml(xml: string): ImportTopic[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const getFields = (item: Element, name: string): string[] => {
    return [...item.getElementsByTagName(name)].map((item) => item.innerHTML);
  };

  const getField = (item: Element, name: string): string => {
    const fields = getFields(item, name);
    if (!fields.length) {
      console.warn(item);
      throw new Error(`Expected field '${name}' in Jira issue`);
    }
    return fields[0];
  };

  // TODO: detect topic status from 'status' field when possible

  return [...doc.getElementsByTagName('item')].map((item) => {
    let title = htmlDecode(getField(item, 'title'));
    // Move Jira identifier to end of title
    title = title.replace(/^\[([^\]]+)\]\s(.+)$/, '$2 ($1)');

    let description = htmlToMarkdown(htmlDecode(getField(item, 'description')));

    const links = getFields(item, 'link');
    const match = /^\[([^\]]+)\]\n?\(([^) ]+ ?[^)]*)\)$/.exec(description)?.[2];
    if (match) {
      description = '';
      links.unshift(match);
    }

    const jiraStatus = getField(item, 'status');
    let status: TopicStatus =
      jiraStatus === 'In Progress' ||
      jiraStatus === 'In Review' ||
      jiraStatus === 'Staging'
        ? 'next'
        : jiraStatus === 'Done'
        ? 'completed'
        : 'open';

    return {
      importId: { jira: getField(item, 'key') },
      status,
      createTime: new Date(getField(item, 'created')).getTime(),
      editTime: new Date(getField(item, 'updated')).getTime(),
      title,
      description,
      links,
      tags: [
        ...getFields(item, 'project'),
        ...getFields(item, 'priority'),
        ...getFields(item, 'status'),
      ],
    };
  });
}
