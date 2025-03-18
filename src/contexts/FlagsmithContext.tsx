import React, { createContext, useContext, useState, useEffect } from "react";
import flagsmith from "flagsmith";

// Define the context type
type FlagsmithContextType = {
  isLoading: boolean;
  hasFeature: (flagName: string) => boolean;
  getValue: (flagName: string, defaultValue?: any) => any;
  getAllFlags: () => Record<string, any>;
  identifyUser: (userId: string, traits?: Record<string, any>) => Promise<any>;
  logout: () => Promise<any>;
  refreshFlags: () => Promise<any>;
};

// Create the context with a default value
const defaultContext: FlagsmithContextType = {
  isLoading: true,
  hasFeature: () => false,
  getValue: (_, defaultValue) => defaultValue,
  getAllFlags: () => ({}),
  identifyUser: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  refreshFlags: () => Promise.resolve(),
};

// Create the context
const FlagsmithContext = createContext<FlagsmithContextType>(defaultContext);

// Create a custom hook to use the context
export function useFlagsmith() {
  return useContext(FlagsmithContext);
}

// Create a provider component
const FlagsmithProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const environmentID = import.meta.env.VITE_FLAGSMITH_ENVIRONMENT_ID;
    console.log("Attempting to initialize Flagsmith with environment ID:", environmentID);

    if (!environmentID || environmentID === "Not configured") {
      console.error("Flagsmith environment ID is not set or invalid. Please check your .env file.");
      setIsLoading(false);
      return;
    }

    flagsmith
      .init({
        environmentID,
        cacheFlags: true,
        onChange: () => {
          console.log("Flags updated by Flagsmith:", flagsmith.getAllFlags());
          setIsInitialized(true);
          setIsLoading(false);
        },
      })
      .then(() => {
        console.log("Flagsmith initialized successfully with flags:", flagsmith.getAllFlags());
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error("Failed to initialize Flagsmith:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const hasFeature = (flagName: string): boolean => {
    if (!isInitialized) {
      console.warn(`Flagsmith not initialized yet, returning false for ${flagName}`);
      return false;
    }
    try {
      return flagsmith.hasFeature(flagName);
    } catch (error) {
      console.error(`Error checking feature ${flagName}:`, error);
      return false;
    }
  };

  const getValue = (flagName: string, defaultValue: any = null): any => {
    if (!isInitialized) return defaultValue;
    try {
      return flagsmith.getValue(flagName, defaultValue);
    } catch (error) {
      console.error(`Error getting value for ${flagName}:`, error);
      return defaultValue;
    }
  };

  const getAllFlags = (): Record<string, any> => {
    if (!isInitialized) return {};
    try {
      return flagsmith.getAllFlags();
    } catch (error) {
      console.error("Error getting all flags:", error);
      return {};
    }
  };

  const identifyUser = async (userId: string, traits: Record<string, any> = {}) => {
    if (!isInitialized) return Promise.resolve();
    try {
      return await flagsmith.identify(userId, traits);
    } catch (error) {
      console.error(`Error identifying user ${userId}:`, error);
      return Promise.resolve();
    }
  };

  const logout = async () => {
    if (!isInitialized) return Promise.resolve();
    try {
      return await flagsmith.logout();
    } catch (error) {
      console.error("Error logging out:", error);
      return Promise.resolve();
    }
  };

  const refreshFlags = async () => {
    setIsLoading(true);
    if (isInitialized) {
      try {
        await flagsmith.getFlags();
        console.log("Flags refreshed:", flagsmith.getAllFlags());
      } catch (error) {
        console.error("Error refreshing flags:", error);
      }
    }
    setIsLoading(false);
    return Promise.resolve();
  };

  const contextValue = {
    isLoading,
    hasFeature,
    getValue,
    getAllFlags,
    identifyUser,
    logout,
    refreshFlags,
  };

  return (
    <FlagsmithContext.Provider value={contextValue}>
      {children}
    </FlagsmithContext.Provider>
  );
};

export { FlagsmithProvider };