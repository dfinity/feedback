import matchers from '@testing-library/jest-dom/matchers';
import 'cross-fetch/polyfill';
import fetch, { Headers, Request, Response } from 'node-fetch';
import { expect, vi } from 'vitest';

expect.extend(matchers);

// See https://github.com/vitest-dev/vitest/issues/3077
const global = globalThis as any;
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

// Use local replica in place of Vite dev server
vi.mock('@dfinity/agent', () => {
  const { HttpAgent, ...rest } = require('@dfinity/agent');
  class MockHttpAgent extends HttpAgent {
    constructor(...args: any[]) {
      super(...args);
      (this as any)._host = 'http://127.0.0.1:4943';
    }
  }
  return {
    ...rest,
    HttpAgent: MockHttpAgent,
  };
});
