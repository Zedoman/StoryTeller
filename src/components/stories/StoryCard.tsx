import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../ui/button"; // Ensured import is present

interface StoryCardProps {
  id?: string;
  title?: string;
  description?: string;
  coverImage?: string;
  theme?: "medieval" | "futuristic" | "horror";
}

const StoryCard = ({
  id = "story-1",
  title = "The Lost Kingdom",
  description = "Embark on an epic journey through ancient ruins and mystical forests to reclaim a forgotten throne.",
  coverImage = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
  theme = "medieval",
}: StoryCardProps) => {
  const themeColors = { medieval: "bg-amber-100 text-amber-800", futuristic: "bg-blue-100 text-blue-800", horror: "bg-red-100 text-red-800" };
  const navigate = useNavigate();
  const [showStartOverPopup, setShowStartOverPopup] = useState(false);
  const isCompleted = localStorage.getItem(`story-completed-${id}`) === "true";

  const handleCardClick = () => {
    if (!isCompleted) {
      navigate(`/story/${id}`);
    }
  };

  const handleStartOverClick = () => {
    setShowStartOverPopup(true);
  };

  const handleStartOverConfirm = () => {
    localStorage.removeItem(`story-completed-${id}`);
    navigate(`/story/${id}`);
    setShowStartOverPopup(false);
  };

  const handleStartOverCancel = () => {
    setShowStartOverPopup(false);
  };

  return (
    <Card className="w-80 h-[400px] flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg bg-white" onClick={handleCardClick}>
      <div className="relative h-48 overflow-hidden">
        <img src={coverImage} alt={title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
        <Badge className={`absolute top-3 right-3 ${themeColors[theme]}`} variant="outline">
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </Badge>
      </div>
      <CardHeader className="pb-2 text-black">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2 pt-2">
        {isCompleted ? (
          <div className="flex items-center space-x-2">
            <span className="text-green-600 font-medium">Completed</span>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click from triggering
                handleStartOverClick();
              }}
              className="text-xs py-1 px-2"
            >
              Start Over
            </Button>
          </div>
        ) : (
          <button
            className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Start Reading
          </button>
        )}
      </CardFooter>

      {showStartOverPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Start Over?</h3>
            <p className="mb-4">This story is already completed. Do you want to start over?</p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleStartOverCancel}>
                Cancel
              </Button>
              <Button onClick={handleStartOverConfirm}>Start Over</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StoryCard;