import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import StoryCard from "./StoryCard";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useFlagsmith } from "@/contexts/FlagsmithContext";
import StoryFeatures from "./StoryFeatures";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface StoryGridProps {
  stories?: Array<{
    id: string;
    title: string;
    description: string;
    coverImage: string;
    theme: "medieval" | "futuristic" | "horror";
  }>;
  onStorySelect?: (id: string) => void;
}

const StoryGrid = ({
  stories = [
    {
      id: "story-1",
      title: "The Lost Kingdom",
      description: "Embark on an epic journey through ancient ruins and mystical forests to reclaim a forgotten throne.",
      coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
      theme: "medieval",
    },
    {
      id: "story-2",
      title: "Neon Shadows",
      description: "Navigate a dystopian cityscape filled with corporate intrigue and cybernetic enhancements.",
      coverImage: "https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=400&q=80",
      theme: "futuristic",
    },
    {
      id: "story-3",
      title: "Whispers in the Dark",
      description: "Uncover the secrets of an abandoned mansion with a history of disappearances and supernatural occurrences.",
      coverImage: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?w=400&q=80",
      theme: "horror",
    },
    {
      id: "story-4",
      title: "Dragon's Breath",
      description: "Join a band of adventurers seeking to defeat an ancient dragon threatening the peaceful valley.",
      coverImage: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=400&q=80",
      theme: "medieval",
    },
    {
      id: "story-5",
      title: "Space Colony Alpha",
      description: "Help establish humanity's first interstellar colony while dealing with alien encounters and resource management.",
      coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80",
      theme: "futuristic",
    },
    {
      id: "story-6",
      title: "The Haunting",
      description: "Investigate paranormal activities in a small town with a dark past and vengeful spirits.",
      coverImage: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&q=80",
      theme: "horror",
    },
  ],
  onStorySelect = (id) => console.log(`Story selected: ${id}`),
}: StoryGridProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [themeFilter, setThemeFilter] = useState("all");

  const { hasFeature } = useFlagsmith();

  const filteredStories = stories.filter((story) => {
    if (story.title.includes("Whispers in the Dark") && !hasFeature("enable_detective_story")) {
      return false;
    }

    const matchesSearch =
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = themeFilter === "all" || story.theme === themeFilter;

    return matchesSearch && matchesTheme;
  });

  return (
    <div className="w-full h-full flex flex-col space-y-6 bg-background p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-1/3">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search stories..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <Select value={themeFilter} onValueChange={setThemeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Themes</SelectItem>
              <SelectItem value="medieval">Medieval</SelectItem>
              <SelectItem value="futuristic">Futuristic</SelectItem>
              <SelectItem value="horror">Horror</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Stories</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredStories.map((story) => (
                <div key={story.id} onClick={() => onStorySelect(story.id)}>
                  <StoryCard
                    id={story.id}
                    title={story.title}
                    description={story.description}
                    coverImage={story.coverImage}
                    theme={story.theme}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-xl font-medium text-gray-500">
                No stories found
              </p>
              <p className="text-gray-400 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoryGrid;