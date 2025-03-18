import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./layout/Header";
import StoryGrid from "./stories/StoryGrid";
import StoryFeatures from "./stories/StoryFeatures";
import { useFlagsmith } from "@/contexts/FlagsmithContext";

interface HomeProps {
  userName?: string;
  userAvatar?: string;
}

const Home = ({
  userName = "John Doe",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
}: HomeProps) => {
  const navigate = useNavigate();
  const { hasFeature, getValue, identifyUser } = useFlagsmith();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserIdentified, setIsUserIdentified] = useState(false);

  // Identify user for personalized feature flags
  useEffect(() => {
    // In a real app, this would use an actual user ID from authentication
    if (!isUserIdentified) {
      identifyUser("user-123", {
        name: userName,
        preferences: {
          theme: isDarkMode ? "dark" : "light",
          favoriteGenre: "fantasy",
        },
      }).then(() => {
        setIsUserIdentified(true);
      });
    }
  }, [userName, isDarkMode, identifyUser, isUserIdentified]);

  // Handler functions
  const handleThemeToggle = () => {
    const newThemeValue = !isDarkMode;
    setIsDarkMode(newThemeValue);

    // Update user traits if they've been identified
    if (isUserIdentified) {
      identifyUser("user-123", {
        preferences: {
          theme: newThemeValue ? "dark" : "light",
        },
      });
    }

    // In a real implementation, this would also update the theme in the DOM
    document.documentElement.classList.toggle("dark", newThemeValue);
  };

  const handleStorySelect = (storyId: string) => {
    console.log(`Selected story: ${storyId}`);
    navigate(`/story/${storyId}`);
  };

  const handleContinueReading = (storyId: string) => {
    console.log(`Continuing story: ${storyId}`);
    navigate(`/story/${storyId}`);
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
    // In a real implementation, this would navigate to the user profile page
  };

  const handleSettingsClick = () => {
    console.log("Settings clicked");
    // In a real implementation, this would open settings dialog or navigate to settings page
  };

  const handleLogoutClick = () => {
    console.log("Logout clicked");
    // In a real implementation, this would handle user logout
  };

  // Check if the continue reading section should be shown based on feature flag
  // Force re-evaluation on each render
  const showContinueReading = hasFeature("show_continue_reading");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        userName={userName}
        userAvatar={userAvatar}
        onProfileClick={handleProfileClick}
        onSettingsClick={handleSettingsClick}
        onLogoutClick={handleLogoutClick}
      />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-8">
        

        <section>
          <StoryGrid onStorySelect={handleStorySelect} />
        </section>
      </main>

      <footer className="bg-background border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 StoryTeller. All rights reserved.</p>
          <p className="mt-2">
            A dynamic choice-based storytelling app with feature flag
            integration.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
