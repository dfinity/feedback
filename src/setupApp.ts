import { HttpAgent } from '@dfinity/agent';
import { backend } from './declarations/backend';

export const applicationName = 'ICP Developer Feedback';

const agent = (backend as any)[Symbol.for('ic-agent-metadata')].config
  .agent as HttpAgent;
if (import.meta.env.PROD) {
  (agent as any)._host = 'https://icp0.io/';
}

if (
  window.location.hostname.endsWith('.icp0.io') ||
  window.location.hostname.endsWith('.ic0.app')
) {
  window.location.hostname = 'dx.internetcomputer.org';
}
