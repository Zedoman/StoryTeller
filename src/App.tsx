import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { FlagsmithProvider } from "./contexts/FlagsmithContext";
import { useFlagsmith } from "./contexts/FlagsmithContext";
import AIStoryTeller from "./components/stories/AIStoryTeller";
import { ThemeProvider } from "./contexts/ThemeContext";

// Lazy load components for better performance
const StoryInterface = lazy(
  () => import("./components/stories/StoryInterface")
);
const FeatureFlagDashboard = lazy(
  () => import("./components/admin/FeatureFlagDashboard")
);
const FeatureFlagDemo = lazy(
  () => import("./components/feature-flags/FeatureFlagDemo")
);
const FlagsmithAdmin = lazy(
  () => import("./components/feature-flags/FlagsmithAdmin")
);

function App() {
  const { hasFeature } = useFlagsmith();
  const isAdmin = hasFeature("is_admin");

  return (
    <ThemeProvider>
    <FlagsmithProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/story/:storyId" element={<StoryInterface />} />
          <Route path="/feature-flags" element={<FeatureFlagDemo />} />
          <Route path="/flagsmith" element={<FlagsmithAdmin />} />
          {isAdmin && <Route path="/admin" element={<FeatureFlagDashboard />} />}
        </Routes>
        <AIStoryTeller />
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </Suspense>
    </FlagsmithProvider>
    </ThemeProvider>
  );
}

export default App;