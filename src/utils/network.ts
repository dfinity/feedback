export function getNetwork(): string | undefined {
  return process.env.DFX_NETWORK;
}

export function isLocalNetwork(): boolean {
  const network = getNetwork();
  return !network || network === 'local';
}
