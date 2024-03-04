export function getNetwork(): string | undefined {
  return import.meta.env.DFX_NETWORK;
}

export function isLocalNetwork(): boolean {
  const network = getNetwork();
  return !network || network === 'local';
}
