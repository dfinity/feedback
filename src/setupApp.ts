import { Actor } from '@dfinity/agent';
import { backend } from './declarations/backend';
import { getNetwork } from './utils/network';

export const applicationName = 'ICP Developer Feedback';

// Redirect to custom domain
if (
  window.location.hostname.endsWith('.icp0.io') ||
  window.location.hostname.endsWith('.ic0.app')
) {
  window.location.hostname = 'dx.internetcomputer.org';
}

// Patch `@dfinity/agent`
const agent = Actor.agentOf(backend);
if (getNetwork() === 'ic') {
  (agent as any)._host = 'https://icp-api.io/';
}

// Redirect to localhost URL for improved page routing
const dfxPort = 4943;
const url = new URL(window.location.href);
const canisterId = url.searchParams.get('canisterId');
if (canisterId && url.port === String(dfxPort)) {
  url.searchParams.delete('canisterId');
  window.location.href = `http://${canisterId}.localhost:${dfxPort}?${url.searchParams}`;
}
