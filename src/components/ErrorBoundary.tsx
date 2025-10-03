import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-cream flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-none shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle className="text-3xl font-display font-bold text-foreground">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-base">
                We're sorry, but something unexpected happened. Don't worry - your data is safe.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Try refreshing the page or returning to your dashboard. If the problem persists, please{" "}
                  <a href="mailto:support@momentum-app.com" className="text-primary hover:underline font-medium">
                    contact support
                  </a>
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={this.handleReload}
                    variant="outline"
                    className="flex-1 border-2 font-semibold"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Reload Page
                  </Button>
                  <Button
                    onClick={this.handleReset}
                    className="flex-1 shadow-sm hover:shadow-md font-semibold"
                    size="lg"
                  >
                    <Home className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}