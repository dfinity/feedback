import Swal from 'sweetalert2';
import { ModStatus, Topic, useTopicStore } from '../stores/topicStore';

export async function promptModMessage(
  topic: Topic,
  modStatus: ModStatus,
): Promise<string | undefined> {
  const result = await Swal.fire({
    title: 'Moderator note:',
    showCancelButton: true,
    confirmButtonColor: '#7450c3', // TODO: refactor
    input: 'text',
    inputPlaceholder: '(Leave blank for default)',
  });
  if (!result.isConfirmed) {
    return;
  }
  const modMessage = result.value || '';
  await useTopicStore.getState().setModStatus(topic, modStatus, modMessage);
  return modMessage;
}
