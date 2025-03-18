import React, { useState } from "react";
import { useFlagsmith } from "@/contexts/FlagsmithContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Check, X } from "lucide-react";
import Header from "../layout/Header";

const FlagsmithAdmin = () => {
  const { refreshFlags } = useFlagsmith();
  const [apiKey, setApiKey] = useState("");
  const [environmentId, setEnvironmentId] = useState(
    import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID || "",
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "none" | "success" | "error"
  >("none");
  const [errorMessage, setErrorMessage] = useState("");

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus("none");
    setErrorMessage("");

    try {
      // In a real implementation, this would validate the API key and environment ID
      // with the Flagsmith API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate a successful connection
      setConnectionStatus("success");

      // Refresh flags to get the latest values
      await refreshFlags();
    } catch (error) {
      setConnectionStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Flagsmith Configuration</h1>

          <Card>
            <CardHeader>
              <CardTitle>Connect to Flagsmith</CardTitle>
              <CardDescription>
                Enter your Flagsmith API key and environment ID to connect to
                your Flagsmith account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="environment-id">Environment ID</Label>
                <Input
                  id="environment-id"
                  value={environmentId}
                  onChange={(e) => setEnvironmentId(e.target.value)}
                  placeholder="env_12345"
                />
                <p className="text-xs text-muted-foreground">
                  You can find this in your Flagsmith dashboard under
                  Environments.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key (optional)</Label>
                <Input
                  id="api-key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ser.12345"
                  type="password"
                />
                <p className="text-xs text-muted-foreground">
                  Required only if you want to manage flags from this interface.
                </p>
              </div>

              {connectionStatus === "error" && (
                <div className="flex items-center p-3 text-sm border rounded-md border-red-200 bg-red-50 text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>
                    {errorMessage || "Failed to connect to Flagsmith"}
                  </span>
                </div>
              )}

              {connectionStatus === "success" && (
                <div className="flex items-center p-3 text-sm border rounded-md border-green-200 bg-green-50 text-green-600">
                  <Check className="h-4 w-4 mr-2" />
                  <span>Successfully connected to Flagsmith</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setApiKey("");
                  setEnvironmentId("");
                  setConnectionStatus("none");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !environmentId}
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">How to use Flagsmith</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Create a free account at{" "}
                <a
                  href="https://flagsmith.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  flagsmith.com
                </a>
              </li>
              <li>Create a new project and environment</li>
              <li>Copy your environment ID and paste it above</li>
              <li>
                Create feature flags in the Flagsmith dashboard with the same
                names used in this app:
              </li>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>enable_dynamic_themes</li>
                <li>use_first_person_narrative</li>
                <li>enable_detective_story</li>
                <li>show_continue_reading</li>
                <li>enable_story_sharing</li>
                <li>is_admin</li>
              </ul>
            </ol>
          </div>
        </div>
      </main>

      <footer className="bg-background border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2023 StoryTeller. All rights reserved.</p>
          <p className="mt-2">Feature flags powered by Flagsmith.</p>
        </div>
      </footer>
    </div>
  );
};

export default FlagsmithAdmin;
