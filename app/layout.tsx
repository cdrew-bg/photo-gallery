import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers.component';
import { siteConfig } from '@/config/site.service';
import './globals.css';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
