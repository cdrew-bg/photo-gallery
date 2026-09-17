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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={(event) => {
          void submit(event);
        }}
        className="fade-up w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl shadow-black/50 backdrop-blur"
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Private collection
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">Photo Gallery</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Enter the password you were given to view and download the photos.
        </p>
        <label
          htmlFor="gallery-password"
          className="mt-8 block text-xs font-medium uppercase tracking-wider text-zinc-400"
        >
          Password
        </label>
        <input
          id="gallery-password"
          type="password"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setRejected(false);
          }}
          className={`mt-2 w-full rounded-lg border bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:ring-2 focus:ring-zinc-400/40 ${rejected ? 'border-red-500/60' : 'border-zinc-700 focus:border-zinc-500'}`}
          placeholder="••••••••"
        />
        {rejected ? (
          <p role="alert" className="mt-2 text-sm text-red-400">
            That password isn&apos;t right — try again.
          </p>
        ) : null}
        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-white active:scale-[0.99]"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
