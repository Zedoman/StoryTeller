import React from "react";
import { useFlagsmith } from "@/contexts/FlagsmithContext";

interface StoryFeaturesProps {
  children: React.ReactNode;
  featureFlag: string;
}

/**
 * A component that conditionally renders its children based on a feature flag
 * If the feature flag is enabled, the children are rendered
 * If the feature flag is disabled, nothing is rendered
 */
const StoryFeatures: React.FC<StoryFeaturesProps> = ({
  children,
  featureFlag,
}) => {
  const { hasFeature } = useFlagsmith();

  // Only render children if the feature flag is enabled
  if (!hasFeature(featureFlag)) {
    return null;
  }

  return <>{children}</>;
};

export default StoryFeatures;
