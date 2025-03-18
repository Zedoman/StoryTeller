import React from "react";
import { useFlagsmith } from "@/contexts/FlagsmithContext";

interface StoryThemeProps {
  children: React.ReactNode;
  theme?: "medieval" | "futuristic" | "horror" | "default";
  defaultClassName?: string;
  themeClassNames?: {
    medieval?: string;
    futuristic?: string;
    horror?: string;
    default?: string;
  };
}

/**
 * A component that applies theme styling based on the enable_dynamic_themes feature flag
 * If the feature flag is enabled, theme-specific styling is applied
 * If the feature flag is disabled, default styling is applied
 */
const StoryTheme = <T extends React.ElementType = "div">({
  children,
  theme = "default",
  defaultClassName = "bg-card",
  themeClassNames = {
    medieval: "bg-amber-50 border-amber-200",
    futuristic: "bg-blue-50 border-blue-200",
    horror: "bg-red-50 border-red-200",
    default: "bg-card",
  },
}: StoryThemeProps & { as?: T }) => {
  const { hasFeature } = useFlagsmith();

  // Determine which class to apply based on the feature flag and theme
  const getThemeClass = () => {
    if (!hasFeature("enable_dynamic_themes")) {
      return defaultClassName;
    }
    return themeClassNames[theme] || defaultClassName;
  };

  // Clone the child element and add the appropriate class
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        className: `${(child as React.ReactElement<any>).props.className || ""} ${getThemeClass()}`.trim(),
      });
    }
    return child;
  });
};

export default StoryTheme;