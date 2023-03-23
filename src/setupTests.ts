import matchers from '@testing-library/jest-dom/matchers';
import 'fake-indexeddb/auto';
import { expect } from 'vitest';

expect.extend(matchers);
