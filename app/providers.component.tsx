'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { Notifications } from '@/components/notifications/notifications.component';
import { queryConfig } from '@/lib/react-query.service';

export function Providers({ children }: { readonly children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: queryConfig }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Notifications />
    </QueryClientProvider>
  );
}
