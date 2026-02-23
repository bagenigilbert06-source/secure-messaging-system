'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Oops! Something went wrong
          </h1>
          
          <p className="text-muted-foreground mb-6">
            We encountered an error while loading your dashboard. Please try again.
          </p>

          {error.message && (
            <div className="bg-muted/50 border border-border rounded-lg p-3 mb-6 text-left">
              <p className="text-xs font-mono text-muted-foreground">
                {error.message}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full gap-2"
            >
              <Link href="/">
                <Home className="w-4 h-4" />
                Go home
              </Link>
            </Button>
          </div>

          {error.digest && (
            <p className="text-xs text-muted-foreground mt-4">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
