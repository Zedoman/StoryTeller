# StoryTeller - Interactive Storytelling with Feature Flags

## Overview

StoryTeller is an interactive choice-based storytelling application that demonstrates the power of feature flags for dynamic content delivery. Users can explore different narrative paths while administrators can control the user experience through feature toggles. The application now includes an innovative AI-powered storytelling feature, `AIStoryTeller`, which generates custom stories on-demand using the Grok API and enhances the experience with text-to-speech narration.

## Features

- **Interactive Stories**: Navigate through branching narratives with multiple choice paths
- **Feature Flag Integration**: Real-time feature toggling using Flagsmith
- **Admin Dashboard**: Control feature availability through an admin interface
- **Dynamic Theming**: Theme changes based on story context (when enabled)
- **Responsive Design**: Works on desktop and mobile devices
- **AIStoryTeller**: Generate unique, on-demand stories using the Grok API with a floating chatbot interface, featuring theme-based styling (medieval, futuristic, horror) and text-to-speech narration

## Tech Stack

- React with TypeScript
- Vite for fast development and building
- React Router for navigation
- Tailwind CSS for styling
- Shadcn UI for component library
- Flagsmith for feature flag management
- Grok API for AI-generated storytelling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd storyteller
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_FLAGSMITH_ENVIRONMENT_ID=your_flagsmith_environment_id
   VITE_GROQ_API_KEY=your_groq_api_key
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Feature Flags

The application uses Flagsmith for feature flag management. The following flags are used:

| Flag Name | Description |
|-----------|-------------|
| `enable_dynamic_themes` | Enable theme changes based on story context |
| `use_first_person_narrative` | Use first person instead of second person narrative |
| `enable_detective_story` | Enable the detective story in the catalog |
| `show_continue_reading` | Show the continue reading section on the home page |
| `enable_story_sharing` | Allow users to share stories with others |
| `is_admin` | Enable access to admin dashboard |

## Application Flow

```mermaid
graph TD
    Start[User Opens App] --> Login{User Logged In?}
    Login -->|Yes| HomeScreen[Home Screen]
    Login -->|No| AuthFlow[Authentication Flow]
    AuthFlow --> HomeScreen
    
    HomeScreen --> BrowseStories[Browse Available Stories]
    HomeScreen --> ResumeStory[Resume Previous Story]
    HomeScreen --> ViewProfile[View User Profile]
    HomeScreen --> AIChat[Open AIStoryTeller Chat]
    
    BrowseStories --> StorySelection[Select Story]
    ResumeStory --> StoryInterface[Story Interface]
    StorySelection --> StoryInterface
    AIChat --> AIStoryteller[AI Story Generation]
    
    subgraph "Story Experience"
        StoryInterface --> ReadContent[Read Story Content]
        ReadContent --> DecisionPoint{Decision Point?}
        DecisionPoint -->|Yes| ShowChoices[Display Choice Options]
        DecisionPoint -->|No| ContinueReading[Continue Reading]
        
        ShowChoices --> UserChoice[User Makes Choice]
        UserChoice --> StoreChoice[Store User Choice in Profile]
        StoreChoice --> UpdateTheme[Update UI Theme Based on Context]
        UpdateTheme --> LoadNextSegment[Load Next Story Segment]
        LoadNextSegment --> ReadContent
        
        ContinueReading --> ReadContent
    end

    subgraph "AI Storyteller Experience"
        AIStoryteller --> EnterPrompt[Enter Story Prompt]
        EnterPrompt --> GenerateStory[Generate Story with Grok API]
        GenerateStory --> DisplayStory[Display Story with Theme]
        DisplayStory --> ReadAloud[Read Story Aloud with Text-to-Speech]
        ReadAloud --> UserControl[Pause/Resume Narration]
        UserControl --> DisplayStory
    end
    
    StoryInterface --> PauseStory[Pause Story]
    PauseStory --> HomeScreen
    
    StoryInterface --> StoryEnd{Story Ended?}
    StoryEnd -->|Yes| EndingReached[Show Story Ending]
    StoryEnd -->|No| ReadContent
    
    EndingReached --> RecordCompletion[Record Story Completion]
    RecordCompletion --> OfferRecommendations[Offer New Story Recommendations]
    OfferRecommendations --> HomeScreen
    
    ViewProfile --> UserChoiceHistory[View Past Choices]
    ViewProfile --> ThemePreferences[Adjust Theme Preferences]
    ViewProfile --> ViewProgress[View Story Progress]
    
    subgraph "Admin Features"
        AdminLogin[Admin Login] --> FeatureFlagConfig[Configure Feature Flags]
        AdminLogin --> ViewAnalytics[View Analytics Dashboard]
        
        FeatureFlagConfig --> ToggleNarrativeStyle[Toggle Narrative Style]
        FeatureFlagConfig --> EnableDisableStories[Enable/Disable Stories]
        FeatureFlagConfig --> ModifyThemes[Modify Available Themes]
        FeatureFlagConfig --> ToggleAIStoryteller[Enable/Disable AIStoryTeller]
        
        ViewAnalytics --> EngagementMetrics[View Engagement Metrics]
        ViewAnalytics --> PathAnalysis[Analyze Popular Story Paths]
        ViewAnalytics --> ABTestResults[Review A/B Test Results]
    end
```

### Setting Up Flagsmith

1. Create a free account at [flagsmith.com](https://flagsmith.com)
2. Create a new project and environment
3. Create feature flags with the names listed above
4. Copy your environment ID and add it to your `.env` file

## Project Structure

```
/src
  /components        # UI components
    /admin           # Admin dashboard components
    /feature-flags   # Feature flag demo and configuration
    /layout          # Layout components (header, navbar)
    /stories         # Story-related components
    /ui              # Shadcn UI components
  /contexts          # React contexts
  /lib               # Utility functions and services
  /types             # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally


## License

This project is licensed under the MIT License - see the LICENSE file for details.
