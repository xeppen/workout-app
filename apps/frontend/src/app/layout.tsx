// src/app/layout.tsx
'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const inter = Inter({ subsets: ['latin'] });
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-gradient-to-r from-blue-200 to-blue-500">
            <AppBar position="static" color="primary">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Workout App
                </Typography>
                <nav>
                  <Link href="/" passHref>
                    <Typography variant="button" className="nav-link">
                      Home
                    </Typography>
                  </Link>
                  <Link href="/workouts" passHref>
                    <Typography variant="button" className="nav-link">
                      Workouts
                    </Typography>
                  </Link>
                  <Link href="/progress" passHref>
                    <Typography variant="button" className="nav-link">
                      Progress
                    </Typography>
                  </Link>
                  <Link href="/exercises" passHref>
                    <Typography variant="button" className="nav-link">
                      Exercises
                    </Typography>
                  </Link>
                </nav>
              </Toolbar>
            </AppBar>
            <Container maxWidth="lg" className="py-6">
              {children}
            </Container>
          </div>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
