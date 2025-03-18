import React from "react";
import { useFlagsmith } from "@/contexts/FlagsmithContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import Header from "../layout/Header";

const FeatureFlagDemo = () => {
  const { hasFeature, getAllFlags, refreshFlags, isLoading } = useFlagsmith();
  const [refreshing, setRefreshing] = React.useState(false);
  const [envId, setEnvId] = React.useState<string>("");
  const [apiKey, setApiKey] = React.useState<string>("");
  const [projectId, setProjectId] = React.useState<string>("");
  const [localFlags, setLocalFlags] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setEnvId(import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID || "Not configured");
    setApiKey(import.meta.env.VITE_FLAGSMITH_API_KEY || "Not configured");
    setProjectId(import.meta.env.VITE_FLAGSMITH_PROJECT_ID || "Not configured");
    console.log("Loaded API Key:", apiKey === "Not configured" ? "Not configured" : "Loaded (hidden for security)");
    console.log("Loaded Environment ID:", envId);
    console.log("Loaded Project ID:", projectId);
  }, []);

  React.useEffect(() => {
    // Initialize local flags based on Flagsmith state
    const flags = getAllFlags();
    const initialFlags: Record<string, boolean> = {};
    Object.keys(flags).forEach((flagId) => {
      initialFlags[flagId] = hasFeature(flagId);
    });
    setLocalFlags(initialFlags);
  }, [hasFeature, getAllFlags]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshFlags();
    const flags = getAllFlags();
    const updatedFlags: Record<string, boolean> = {};
    Object.keys(flags).forEach((flagId) => {
      updatedFlags[flagId] = hasFeature(flagId);
    });
    setLocalFlags(updatedFlags);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleToggle = async (flagId: string) => {
    try {
      const newValue = !localFlags[flagId]; // Use local state for immediate toggle
      setLocalFlags((prev) => ({
        ...prev,
        [flagId]: newValue,
      }));

      if (!apiKey || apiKey === "Not configured") {
        throw new Error("Flagsmith API key is not configured in .env. Please set VITE_FLAGSMITH_API_KEY to a valid server-side API key.");
      }

      if (!envId || envId === "Not configured") {
        throw new Error("Flagsmith environment ID is not configured in .env. Please set VITE_FLAGSMITH_ENVIRONMENT_ID.");
      }

      if (!projectId || projectId === "Not configured") {
        throw new Error("Flagsmith project ID is not configured in .env. Please set VITE_FLAGSMITH_PROJECT_ID.");
      }

      // Step 1: Fetch the feature (flag) to get its numeric ID
      const featuresResponse = await fetch(`https://api.flagsmith.com/api/v1/projects/${projectId}/features/`, {
        method: "GET",
        headers: {
          "Authorization": `Api-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!featuresResponse.ok) {
        const errorData = await featuresResponse.text();
        console.log("Features response error:", errorData);
        throw new Error(`Failed to fetch features: ${errorData} (Status: ${featuresResponse.status})`);
      }

      const featuresData = await featuresResponse.json();
      console.log("Features data (raw):", JSON.stringify(featuresData, null, 2));

      let featuresArray;
      if (Array.isArray(featuresData)) {
        featuresArray = featuresData;
      } else if (featuresData.results && Array.isArray(featuresData.results)) {
        featuresArray = featuresData.results;
      } else if (featuresData.features && Array.isArray(featuresData.features)) {
        featuresArray = featuresData.features;
      } else if (featuresData.data && Array.isArray(featuresData.data)) {
        featuresArray = featuresData.data;
      } else if (typeof featuresData === "object" && Object.keys(featuresData).length > 0) {
        const featureKeys = Object.keys(featuresData).find(
          (key) => featuresData[key] && typeof featuresData[key] === "object" && "name" in featuresData[key]
        );
        if (featureKeys) {
          featuresArray = [featuresData[featureKeys]];
        }
      }

      if (!featuresArray || !Array.isArray(featuresArray) || featuresArray.length === 0) {
        throw new Error(`Unexpected response format: No recognizable feature array found in features data. Response: ${JSON.stringify(featuresData, null, 2)}`);
      }

      const feature = featuresArray.find((f: any) => f.name === flagId);
      if (!feature) {
        throw new Error(`Feature ${flagId} not found in Flagsmith. Available features: ${JSON.stringify(featuresArray.map((f) => f.name))}`);
      }
      const featureId = feature.id;

      // Step 2: Fetch or create the feature state for this environment
      let featureStateId;
      const featureStatesResponse = await fetch(
        `https://api.flagsmith.com/api/v1/environments/${envId}/featurestates/`,
        {
          method: "GET",
          headers: {
            "Authorization": `Api-Key ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!featureStatesResponse.ok) {
        const errorData = await featureStatesResponse.text();
        console.log("Feature states response error:", errorData);
        throw new Error(`Failed to fetch feature states: ${errorData} (Status: ${featureStatesResponse.status})`);
      }

      const featureStatesData = await featureStatesResponse.json();
      let featureState = featureStatesData.results.find((fs: any) => fs.feature === featureId);

      if (!featureState) {
        // Create a new feature state if it doesn't exist
        const createResponse = await fetch(`https://api.flagsmith.com/api/v1/environments/${envId}/featurestates/`, {
          method: "POST",
          headers: {
            "Authorization": `Api-Key ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feature: featureId,
            enabled: false, // Initial state
            environment: envId,
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.text();
          console.log("Create feature state error:", errorData);
          throw new Error(`Failed to create feature state: ${errorData} (Status: ${createResponse.status})`);
        }

        const createdState = await createResponse.json();
        featureState = createdState;
        featureStateId = createdState.id;
      } else {
        featureStateId = featureState.id;
      }

      // Step 3: Update the feature state for the environment
      const updateResponse = await fetch(
        `https://api.flagsmith.com/api/v1/environments/${envId}/featurestates/${featureStateId}/`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Api-Key ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enabled: newValue,
          }),
        }
      );

      if (!updateResponse.ok) {
        const contentType = updateResponse.headers.get("content-type");
        let errorData;
        if (contentType && contentType.includes("application/json")) {
          errorData = await updateResponse.json();
        } else {
          errorData = await updateResponse.text();
        }
        console.log("Update error response (raw):", JSON.stringify(errorData, null, 2));
        throw new Error(
          `Failed to update feature state: ${typeof errorData === "string" ? errorData : errorData.detail || updateResponse.statusText} (Status: ${updateResponse.status})`
        );
      }

      // Step 4: Manually fetch the updated feature state to confirm
      const updatedFeatureStateResponse = await fetch(
        `https://api.flagsmith.com/api/v1/environments/${envId}/featurestates/${featureStateId}/`,
        {
          method: "GET",
          headers: {
            "Authorization": `Api-Key ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!updatedFeatureStateResponse.ok) {
        const errorData = await updatedFeatureStateResponse.text();
        console.log("Updated feature state fetch error:", errorData);
        throw new Error(`Failed to fetch updated feature state: ${errorData} (Status: ${updatedFeatureStateResponse.status})`);
      }

      const updatedFeatureState = await updatedFeatureStateResponse.json();
      const serverConfirmedValue = updatedFeatureState.enabled;
      console.log(`Server-confirmed value for ${flagId}:`, serverConfirmedValue);

      // Step 5: Try to refresh Flagsmith SDK state (for other components)
      await refreshFlags();
      console.log(`After refreshFlags(), hasFeature(${flagId}) returns:`, hasFeature(flagId));

      // Step 6: Update local state with the server-confirmed value
      setLocalFlags((prev) => ({
        ...prev,
        [flagId]: serverConfirmedValue, // Trust the server's response
      }));
    } catch (error) {
      console.error(`Error toggling flag ${flagId}:`, error);
      // Fetch the current server state to ensure UI consistency
      try {
        const featuresResponse = await fetch(`https://api.flagsmith.com/api/v1/projects/${projectId}/features/`, {
          method: "GET",
          headers: {
            "Authorization": `Api-Key ${apiKey}`,
            "Content-Type": "application/json",
          },
        });
        const featuresData = await featuresResponse.json();
        const featuresArray = featuresData.results || featuresData;
        const feature = featuresArray.find((f: any) => f.name === flagId);

        const featureStatesResponse = await fetch(
          `https://api.flagsmith.com/api/v1/environments/${envId}/featurestates/`,
          {
            method: "GET",
            headers: {
              "Authorization": `Api-Key ${apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );
        const featureStatesData = await featureStatesResponse.json();
        const featureState = featureStatesData.results.find((fs: any) => fs.feature === feature?.id);
        const serverValue = featureState ? featureState.enabled : hasFeature(flagId);
        setLocalFlags((prev) => ({
          ...prev,
          [flagId]: serverValue,
        }));
      } catch (fetchError) {
        console.error("Error fetching server state on failure:", fetchError);
        setLocalFlags((prev) => ({
          ...prev,
          [flagId]: hasFeature(flagId), // Fallback to SDK state
        }));
      }
      alert(`Failed to toggle ${flagId}. Check console for details.`);
    }
  };

  const flags = getAllFlags();
  const flagIds = Object.keys(flags);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Feature Flags</h1>

          <div className="mb-6 p-4 border rounded-md bg-muted">
            <h2 className="text-lg font-semibold mb-2">
              Environment Configuration
            </h2>
            <p className="text-sm mb-2">
              <strong>Environment ID:</strong> {envId}
            </p>
            <p className="text-sm mb-2">
              <strong>Project ID:</strong> {projectId}
            </p>
            <p className="text-sm mb-2">
              <strong>API Key:</strong>{" "}
              {apiKey === "Not configured" ? "Not configured" : "Configured (hidden for security)"}
            </p>
            {(envId === "Not configured" || projectId === "Not configured") && (
              <div className="flex items-center text-amber-600 text-sm mt-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>
                  No environment ID, project ID, or API key found in .env file. Flags may not load or update correctly.
                </span>
              </div>
            )}
          </div>

          <div className="mb-6 flex items-center">
            <Button
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="mb-4 flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh Flags"}</span>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            These feature flags control various aspects of the StoryTeller
            application. Toggle them to see how they affect the user experience.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flagIds.map((flagId) => (
              <Card key={flagId}>
                <CardHeader>
                  <CardTitle>{flagId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</CardTitle>
                  <CardDescription>
                    {flags[flagId]?.description || `Controls feature: ${flagId}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Status:{" "}
                    <span
                      className={
                        localFlags[flagId] ? "text-green-500" : "text-red-500"
                      }
                    >
                      {localFlags[flagId] ? "Enabled" : "Disabled"}
                    </span>
                  </span>
                  <Switch
                    checked={localFlags[flagId]}
                    onCheckedChange={() => handleToggle(flagId)}
                  />
                </CardContent>
              </Card>
            ))}
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

export default FeatureFlagDemo;