import { AppRouter } from '@/app/components/AppRouter';
import { SupabaseAuthProvider } from '@/auth/components/SupabaseAuthProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import { queryClient } from '~/lib/react-query';

// Import theme CSS files that define all --t-* CSS variables
import 'twenty-ui/theme-dark.css';
import 'twenty-ui/theme-light.css';

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider colorScheme="light">
          <SupabaseAuthProvider>
            <AppRouter />
          </SupabaseAuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};
