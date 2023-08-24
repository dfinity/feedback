import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import App from './App';
import { StrictMode } from 'react';

describe('App', () => {
  test('renders as expected', () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    expect(screen.getByText(/Browse/i)).toBeInTheDocument();
  });
});
