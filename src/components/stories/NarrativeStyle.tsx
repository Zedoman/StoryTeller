import React from "react";
import { useFlagsmith } from "@/contexts/FlagsmithContext";

interface NarrativeStyleProps {
  content: string;
}

/**
 * A component that transforms text content based on the use_first_person_narrative feature flag
 * If the feature flag is enabled, content is transformed to first person
 * If the feature flag is disabled, content remains in second person
 */
const NarrativeStyle: React.FC<NarrativeStyleProps> = ({ content }) => {
  const { hasFeature } = useFlagsmith();

  // Transform content based on feature flag
  const transformContent = () => {
    if (hasFeature("use_first_person_narrative")) {
      // Simple transformation for demo purposes
      if (!content.startsWith("I")) {
        let transformedContent = content.replace(/You /g, "I ");
        transformedContent = transformedContent.replace(/Your /g, "My ");
        return transformedContent;
      }
    } else {
      // Ensure content is in second person
      if (!content.startsWith("You")) {
        let transformedContent = content.replace(/I /g, "You ");
        transformedContent = transformedContent.replace(/My /g, "Your ");
        return transformedContent;
      }
    }

    return content;
  };

  return <p className="text-lg leading-relaxed">{transformContent()}</p>;
};

export default NarrativeStyle;
