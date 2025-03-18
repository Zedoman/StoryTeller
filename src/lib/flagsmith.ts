import flagsmith from "flagsmith";

// Export the flagsmith instance
export default flagsmith;

// Helper functions for common flag operations
export const getFlag = (flagName: string) => {
  try {
    return flagsmith.hasFeature(flagName);
  } catch (error) {
    console.error(`Error checking feature ${flagName}:`, error);
    return false;
  }
};

export const getFlagValue = (flagName: string, defaultValue: any = null) => {
  try {
    return flagsmith.getValue(flagName, defaultValue);
  } catch (error) {
    console.error(`Error getting value for ${flagName}:`, error);
    return defaultValue;
  }
};

export const identifyUser = (
  userId: string,
  traits: Record<string, any> = {},
) => {
  try {
    return flagsmith.identify(userId, traits);
  } catch (error) {
    console.error(`Error identifying user ${userId}:`, error);
    return Promise.resolve();
  }
};

export const logout = () => {
  try {
    return flagsmith.logout();
  } catch (error) {
    console.error("Error logging out:", error);
    return Promise.resolve();
  }
};
