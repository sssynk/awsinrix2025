'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, LayoutGrid, Zap, Shield } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Multi-Agent AI Platform</span>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Enterprise Assistant
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            AI-powered multi-agent system that integrates with your workspace tools
            to provide intelligent insights and automation across Jira, Asana, HubSpot, and Linear.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={login} className="text-lg">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="text-lg">
              Learn More
            </Button>
          </div>

          {/* Features */}
          <div className="mt-20 grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <Bot className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Multi-Agent System</CardTitle>
                <CardDescription>
                  Specialized AI agents work together to handle complex enterprise tasks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <LayoutGrid className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Workspace Integrations</CardTitle>
                <CardDescription>
                  Connect seamlessly with Jira, Asana, HubSpot, Linear, and more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Intelligent Automation</CardTitle>
                <CardDescription>
                  Automate workflows and get AI-powered insights from your data
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Enterprise Assistant. Powered by AWS Cognito.</p>
        </div>
      </footer>
    </div>
  );
}
