import { AppRouter } from '@/app/components/AppRouter';
import { SupabaseAuthProvider } from '@/auth/components/SupabaseAuthProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from '~/lib/react-query';

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <SupabaseAuthProvider>
          <AppRouter />
        </SupabaseAuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};
