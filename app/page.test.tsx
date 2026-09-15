import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Home from './page';

test('renders the password gate before any gallery content', () => {
  render(<Home />);
  expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
  expect(screen.getByLabelText('Password')).toBeVisible();
});

test('does not render the gallery while locked', () => {
  render(<Home />);
  expect(screen.queryByText(/loading gallery/i)).not.toBeInTheDocument();
});
