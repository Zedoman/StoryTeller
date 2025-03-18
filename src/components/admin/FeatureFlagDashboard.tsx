import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFlagsmith } from "@/contexts/FlagsmithContext";

const FeatureFlagDashboard = () => {
  const { hasFeature, getAllFlags, refreshFlags } = useFlagsmith();
  const [localFlags, setLocalFlags] = React.useState<Record<string, boolean>>({});
  const [apiKey, setApiKey] = React.useState<string>("");
  const [envId, setEnvId] = React.useState<string>("");

  React.useEffect(() => {
    setApiKey(import.meta.env.VITE_FLAGSMITH_API_KEY || "Not configured");
    setEnvId(import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID || "Not configured");
    const flags = getAllFlags();
    const initialFlags: Record<string, boolean> = {};
    Object.keys(flags).forEach((flagId) => {
      initialFlags[flagId] = hasFeature(flagId);
    });
    setLocalFlags(initialFlags);
  }, [hasFeature, getAllFlags]);

  const toggleFlagHandler = async (flagId: string) => {
    try {
      const newValue = !hasFeature(flagId);
      setLocalFlags((prev) => ({
        ...prev,
        [flagId]: newValue,
      }));

      if (!apiKey || apiKey === "Not configured") {
        throw new Error("Flagsmith API key is not configured in .env");
      }

      if (!envId || envId === "Not configured") {
        throw new Error("Flagsmith environment ID is not configured in .env");
      }

      const featuresResponse = await fetch(`https://api.flagsmith.com/api/v1/features/`, {
        method: "GET",
        headers: {
          "Authorization": `Api-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!featuresResponse.ok) {
        const errorData = await featuresResponse.text();
        throw new Error(`Failed to fetch features: ${errorData} (Status: ${featuresResponse.status})`);
      }

      const featuresData = await featuresResponse.json();
      const feature = featuresData.results.find((f: any) => f.name === flagId);
      if (!feature) {
        throw new Error(`Feature ${flagId} not found in Flagsmith`);
      }
      const featureId = feature.id;

      const featureStatesResponse = await fetch(
        `https://api.flagsmith.com/api/v1/environments/${envId}/feature-states/?feature=${featureId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Api-Key ${apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!featureStatesResponse.ok) {
        const errorData = await featureStatesResponse.text();
        throw new Error(`Failed to fetch feature states: ${errorData} (Status: ${featureStatesResponse.status})`);
      }

      const featureStatesData = await featureStatesResponse.json();
      const featureState = featureStatesData.results[0];
      if (!featureState) {
        throw new Error(`Feature state for ${flagId} not found in environment ${envId}`);
      }
      const featureStateId = featureState.id;

      const updateResponse = await fetch(
        `https://api.flagsmith.com/api/v1/environments/${envId}/feature-states/${featureStateId}/`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Api-Key ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enabled: newValue,
            feature: featureId,
            environment: envId,
          }),
        },
      );

      if (!updateResponse.ok) {
        const contentType = updateResponse.headers.get("content-type");
        let errorData;
        if (contentType && contentType.includes("application/json")) {
          errorData = await updateResponse.json();
        } else {
          errorData = await updateResponse.text();
        }
        console.log("Update error response:", errorData);
        throw new Error(`Failed to update feature state: ${typeof errorData === "string" ? errorData : errorData.detail || updateResponse.statusText} (Status: ${updateResponse.status})`);
      }

      await refreshFlags();
      setLocalFlags((prev) => ({
        ...prev,
        [flagId]: hasFeature(flagId),
      }));
    } catch (error) {
      console.error(`Error toggling flag ${flagId}:`, error);
      alert(`Failed to toggle ${flagId}. Check console for details.`);
      setLocalFlags((prev) => ({
        ...prev,
        [flagId]: hasFeature(flagId),
      }));
    }
  };

  const flags = getAllFlags();
  const flagIds = Object.keys(flags);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Feature Flag Dashboard</h1>

      <Tabs defaultValue="story-features">
        <TabsList className="mb-4">
          <TabsTrigger value="story-features">Story Features</TabsTrigger>
          <TabsTrigger value="ui-features">UI Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="story-features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flagIds
              .filter((flagId) =>
                ["use_first_person_narrative", "enable_detective_story", "enable_story_sharing"].includes(flagId),
              )
              .map((flagId) => (
                <Card key={flagId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{flagId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</CardTitle>
                        <CardDescription>
                          {flags[flagId]?.description || `Controls feature: ${flagId}`}
                        </CardDescription>
                      </div>
                      <Switch
                        checked={localFlags[flagId]}
                        onCheckedChange={() => toggleFlagHandler(flagId)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Status:{" "}
                      <span
                        className={
                          localFlags[flagId] ? "text-green-500" : "text-red-500"
                        }
                      >
                        {localFlags[flagId] ? "Enabled" : "Disabled"}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="ui-features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flagIds
              .filter((flagId) => ["enable_dynamic_themes", "is_admin"].includes(flagId))
              .map((flagId) => (
                <Card key={flagId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{flagId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</CardTitle>
                        <CardDescription>
                          {flags[flagId]?.description || `Controls feature: ${flagId}`}
                        </CardDescription>
                      </div>
                      <Switch
                        checked={localFlags[flagId]}
                        onCheckedChange={() => toggleFlagHandler(flagId)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Status:{" "}
                      <span
                        className={
                          localFlags[flagId] ? "text-green-500" : "text-red-500"
                        }
                      >
                        {localFlags[flagId] ? "Enabled" : "Disabled"}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Analytics</CardTitle>
              <CardDescription>
                Track how users interact with different story paths and UI
                configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This is a placeholder for the analytics dashboard. In a real
                implementation, this would show charts and data about user
                engagement with different features.
              </p>
              <div className="bg-muted p-4 rounded-md">
                <p className="font-medium">Sample Metrics:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Story completion rate: 68%</li>
                  <li>Average time spent per story: 12 minutes</li>
                  <li>
                    Most popular story path: "The Enchanted Forest" → Left Path
                    → Help Creature
                  </li>
                  <li>
                    A/B test results: First-person narrative shows 15% higher
                    engagement
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Export Data</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeatureFlagDashboard;