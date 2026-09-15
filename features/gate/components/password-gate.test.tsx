import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PasswordGate } from './password-gate.component';

it('hides children behind the password form', () => {
  render(
    <PasswordGate>
      <p>secret gallery</p>
    </PasswordGate>,
  );
  expect(screen.queryByText('secret gallery')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Password')).toBeVisible();
});

it('shows an error for a wrong password', async () => {
  render(
    <PasswordGate>
      <p>secret gallery</p>
    </PasswordGate>,
  );
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Enter' }));
  expect(await screen.findByRole('alert')).toBeVisible();
});
