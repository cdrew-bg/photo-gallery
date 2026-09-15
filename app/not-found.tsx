import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <h1>404 — Not found</h1>
      <Link href="/">Go home</Link>
    </main>
  );
}
