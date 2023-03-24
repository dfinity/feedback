import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders as expected', () => {
    render(<App />);
    expect(screen.getByText(/Browse/i)).toBeInTheDocument();
  });
});
