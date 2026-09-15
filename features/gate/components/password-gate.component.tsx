'use client';

import { type FormEvent, type ReactNode, useState, useSyncExternalStore } from 'react';
import {
  readLockedSnapshot,
  readUnlockFlag,
  subscribeUnlock,
  verifyPassword,
  writeUnlockFlag,
} from '@/lib/password-gate.service';

interface PasswordGateProps {
  readonly children: ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const unlocked = useSyncExternalStore(subscribeUnlock, readUnlockFlag, readLockedSnapshot);
  const [input, setInput] = useState('');
  const [rejected, setRejected] = useState(false);
  if (unlocked) {
    return <>{children}</>;
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await verifyPassword(input)) {
      writeUnlockFlag();
      return;
    }
    setRejected(true);
  }
  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}
      className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4"
    >
      <h1 className="text-2xl font-semibold">Photo Gallery</h1>
      <label htmlFor="gallery-password">Password</label>
      <input
        id="gallery-password"
        type="password"
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
          setRejected(false);
        }}
        className="rounded border px-3 py-2"
      />
      {rejected ? (
        <p role="alert" className="text-red-600">
          Wrong password
        </p>
      ) : null}
      <button type="submit" className="rounded bg-black px-4 py-2 text-white">
        Enter
      </button>
    </form>
  );
}
