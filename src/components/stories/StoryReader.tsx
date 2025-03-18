import React, { useState, useEffect } from "react";
import { useFlagsmith } from "@/contexts/FlagsmithContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import StoryTheme from "./StoryTheme";
import StoryFeatures from "./StoryFeatures";
import NarrativeStyle from "./NarrativeStyle";

interface Choice {
  id: string;
  text: string;
  nextSegmentId: string;
}

interface StorySegment {
  id: string;
  content: string;
  choices?: Choice[];
  theme?: "medieval" | "futuristic" | "horror" | "default";
  isEnding?: boolean;
}

interface StoryReaderProps {
  storyId: string;
  initialSegmentId?: string;
  onExit?: () => void;
  onComplete?: (choices: string[]) => void;
}

const StoryReader = ({
  storyId = "default-story",
  initialSegmentId = "start",
  onExit = () => {},
  onComplete = () => {},
}: StoryReaderProps) => {
  const { hasFeature, getValue } = useFlagsmith();
  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [loading, setLoading] = useState(true);
  const [userChoices, setUserChoices] = useState<string[]>([]);
  const [narrativeStyle, setNarrativeStyle] = useState<"first-person" | "third-person">("third-person");
  const [isCompleted, setIsCompleted] = useState(false); // Track completion status

  const storiesData: Record<string, Record<string, StorySegment>> = {
    "story-1": {
      start: {
        id: "start",
        content: "You stand at the edge of a misty, ancient forest, the air thick with the scent of pine and mystery. A crumbling stone archway looms ahead, flanked by two shadowy paths—one winding into darkness, the other glowing faintly with an eerie light.",
        choices: [
          { id: "choice-1", text: "Venture down the dark path with a torch", nextSegmentId: "dark-path" },
          { id: "choice-2", text: "Follow the glowing path with curiosity", nextSegmentId: "glowing-path" },
        ],
        theme: "medieval",
      },
      "dark-path": {
        id: "dark-path",
        content: "The torch flickers as you descend into a cavernous gloom. The walls pulse with faint runes, and a chilling whisper echoes. Suddenly, a spectral knight materializes, its armor clanking ominously.",
        choices: [
          { id: "choice-3", text: "Challenge the knight to a duel", nextSegmentId: "knight-duel" },
          { id: "choice-4", text: "Offer a peace gesture with your last coin", nextSegmentId: "knight-peace" },
        ],
        theme: "horror",
      },
      "glowing-path": {
        id: "glowing-path",
        content: "The path leads to a sacred grove where a wise druid awaits. He speaks of a forgotten throne hidden deep within the forest.",
        choices: [
          { id: "choice-5", text: "Accept the druid’s quest to find the throne", nextSegmentId: "throne-quest" },
          { id: "choice-6", text: "Decline and seek your own path", nextSegmentId: "own-path" },
        ],
        theme: "medieval",
      },
      "knight-duel": {
        id: "knight-duel",
        content: "You draw your sword, the clash of steel ringing through the cavern. The knight fights with unearthly skill, but a weak point in its armor glints.",
        choices: [
          { id: "choice-7", text: "Strike the weak point with all your might", nextSegmentId: "knight-victory" },
          { id: "choice-8", text: "Flee as the knight falters", nextSegmentId: "knight-escape" },
        ],
        theme: "medieval",
      },
      "knight-peace": {
        id: "knight-peace",
        content: "The knight accepts your coin and reveals a hidden passage to a treasure vault guarded by a skeletal dragon.",
        choices: [
          { id: "choice-9", text: "Descend into the vault", nextSegmentId: "treasure-chamber" },
          { id: "choice-10", text: "Thank the knight and retreat", nextSegmentId: "start" },
        ],
        theme: "horror",
      },
      "throne-quest": {
        id: "throne-quest",
        content: "You journey through enchanted woods, battling goblins and uncovering ancient relics. At last, you reach the throne of the Lost Kingdom.",
        isEnding: true,
        theme: "medieval",
      },
      "own-path": {
        id: "own-path",
        content: "You carve your own destiny, becoming a legendary wanderer of the ancient forest, forever free.",
        isEnding: true,
        theme: "medieval",
      },
      "knight-victory": {
        id: "knight-victory",
        content: "Your strike shatters the knight, revealing a golden amulet that leads you to the Lost Kingdom’s throne.",
        isEnding: true,
        theme: "medieval",
      },
      "knight-escape": {
        id: "knight-escape",
        content: "You flee, the knight’s laughter haunting your steps. The forest grows silent, a mystery unsolved but survived.",
        isEnding: true,
        theme: "horror",
      },
      "treasure-chamber": {
        id: "treasure-chamber",
        content: "The skeletal dragon awakens, its fiery breath singeing your cloak. A hidden exit glows behind its hoard.",
        choices: [
          { id: "choice-11", text: "Fight the dragon with a gem’s power", nextSegmentId: "dragon-victory" },
          { id: "choice-12", text: "Dodge the flames and escape", nextSegmentId: "dragon-escape" },
        ],
        theme: "horror",
      },
      "dragon-victory": {
        id: "dragon-victory",
        content: "The gem unleashes a blinding light, vanquishing the dragon. You claim its hoard, a hero of legend.",
        isEnding: true,
        theme: "medieval",
      },
      "dragon-escape": {
        id: "dragon-escape",
        content: "You escape, the dragon’s roars fading. A new path lies ahead, shrouded in fog.",
        isEnding: true,
        theme: "horror",
      },
    },
    "story-2": {
      start: {
        id: "start",
        content: "You’re in Neon City, a sprawling dystopia of flickering holograms and cybernetic street vendors. A mysterious message on your neural implant points to a corporate conspiracy.",
        choices: [
          { id: "choice-1", text: "Hack into the corporate network", nextSegmentId: "hack-network" },
          { id: "choice-2", text: "Meet an informant in the underworld", nextSegmentId: "informant-meet" },
        ],
        theme: "futuristic",
      },
      "hack-network": {
        id: "hack-network",
        content: "Your hack reveals encrypted files about a cybernetic enhancement project. A security AI detects your intrusion and locks you out.",
        choices: [
          { id: "choice-3", text: "Override the AI with a virus", nextSegmentId: "virus-override" },
          { id: "choice-4", text: "Disconnect and flee the scene", nextSegmentId: "flee-scene" },
        ],
        theme: "futuristic",
      },
      "informant-meet": {
        id: "informant-meet",
        content: "The informant, a cybernetic-enhanced smuggler, shares intel about a secret lab. But a corporate assassin drones are closing in.",
        choices: [
          { id: "choice-5", text: "Fight the drones with the smuggler", nextSegmentId: "fight-drones" },
          { id: "choice-6", text: "Sneak away to the lab alone", nextSegmentId: "lab-sneak" },
        ],
        theme: "futuristic",
      },
      "virus-override": {
        id: "virus-override",
        content: "The virus works, exposing the project’s dark truth: a mind-control chip. You’re now a target of the corporation.",
        isEnding: true,
        theme: "futuristic",
      },
      "flee-scene": {
        id: "flee-scene",
        content: "You escape the AI, but the conspiracy remains hidden. You live to hack another day.",
        isEnding: true,
        theme: "futuristic",
      },
      "fight-drones": {
        id: "fight-drones",
        content: "Together, you disable the drones, but the smuggler betrays you, taking the intel for himself.",
        isEnding: true,
        theme: "futuristic",
      },
      "lab-sneak": {
        id: "lab-sneak",
        content: "You infiltrate the lab, uncovering a mind-control prototype. You destroy it, saving Neon City from tyranny.",
        isEnding: true,
        theme: "futuristic",
      },
    },
    "story-3": {
      start: {
        id: "start",
        content: "You arrive at Ravenwood Mansion at midnight, its windows dark and air heavy with dread. A creak echoes from within as you step onto the porch.",
        choices: [
          { id: "choice-1", text: "Enter through the front door", nextSegmentId: "front-door" },
          { id: "choice-2", text: "Sneak around to the back", nextSegmentId: "back-entrance" },
        ],
        theme: "horror",
      },
      "front-door": {
        id: "front-door",
        content: "The door slams shut behind you, and ghostly whispers fill the air. A shadowy figure appears at the top of the staircase.",
        choices: [
          { id: "choice-3", text: "Confront the figure", nextSegmentId: "confront-figure" },
          { id: "choice-4", text: "Hide in the nearby closet", nextSegmentId: "hide-closet" },
        ],
        theme: "horror",
      },
      "back-entrance": {
        id: "back-entrance",
        content: "You find a broken window leading to the kitchen. Inside, blood-stained knives are scattered on the counter.",
        choices: [
          { id: "choice-5", text: "Search the kitchen for clues", nextSegmentId: "kitchen-clues" },
          { id: "choice-6", text: "Head toward the basement door", nextSegmentId: "basement-door" },
        ],
        theme: "horror",
      },
      "confront-figure": {
        id: "confront-figure",
        content: "The figure reveals itself as a vengeful spirit, cursing you to join its eternal torment.",
        isEnding: true,
        theme: "horror",
      },
      "hide-closet": {
        id: "hide-closet",
        content: "You escape the figure’s notice and find a diary detailing the mansion’s cursed history.",
        isEnding: true,
        theme: "horror",
      },
      "kitchen-clues": {
        id: "kitchen-clues",
        content: "You uncover a note about a ritual in the basement. A sudden scream chills your blood.",
        isEnding: true,
        theme: "horror",
      },
      "basement-door": {
        id: "basement-door",
        content: "The basement holds a pentagram glowing red. You stop the ritual just in time, breaking the curse.",
        isEnding: true,
        theme: "horror",
      },
    },
    "story-4": {
      start: {
        id: "start",
        content: "You join a band of adventurers in a sunlit valley, the shadow of an ancient dragon looming over the horizon. The village elder pleads for your help.",
        choices: [
          { id: "choice-1", text: "Gather weapons from the blacksmith", nextSegmentId: "blacksmith" },
          { id: "choice-2", text: "Seek the dragon’s lair immediately", nextSegmentId: "dragon-lair" },
        ],
        theme: "medieval",
      },
      "blacksmith": {
        id: "blacksmith",
        content: "The blacksmith forges a legendary sword imbued with magic. You feel ready to face the dragon.",
        choices: [
          { id: "choice-3", text: "Head to the dragon’s lair", nextSegmentId: "dragon-lair" },
          { id: "choice-4", text: "Train with the sword first", nextSegmentId: "train-sword" },
        ],
        theme: "medieval",
      },
      "dragon-lair": {
        id: "dragon-lair",
        content: "The dragon’s lair is a smoldering cave. It awakens, its fiery breath illuminating the darkness.",
        choices: [
          { id: "choice-5", text: "Attack the dragon head-on", nextSegmentId: "dragon-fight" },
          { id: "choice-6", text: "Search for a weak spot", nextSegmentId: "weak-spot" },
        ],
        theme: "medieval",
      },
      "train-sword": {
        id: "train-sword",
        content: "Your training hones your skills, making you a master swordsman. You march to the dragon’s lair with confidence.",
        isEnding: true,
        theme: "medieval",
      },
      "dragon-fight": {
        id: "dragon-fight",
        content: "You battle fiercely, but the dragon’s scales are impenetrable. You fall, a hero remembered.",
        isEnding: true,
        theme: "medieval",
      },
      "weak-spot": {
        id: "weak-spot",
        content: "You spot a gap in the dragon’s scales and strike true, slaying the beast and saving the valley.",
        isEnding: true,
        theme: "medieval",
      },
    },
    "story-5": {
      start: {
        id: "start",
        content: "You’re aboard the starship *Alpha Dawn*, tasked with establishing humanity’s first interstellar colony. An alien signal disrupts your systems.",
        choices: [
          { id: "choice-1", text: "Trace the signal’s source", nextSegmentId: "signal-source" },
          { id: "choice-2", text: "Focus on repairing the systems", nextSegmentId: "repair-systems" },
        ],
        theme: "futuristic",
      },
      "signal-source": {
        id: "signal-source",
        content: "The signal leads to a nearby planet with alien ruins. A glowing artifact hums with energy.",
        choices: [
          { id: "choice-3", text: "Touch the artifact", nextSegmentId: "artifact-touch" },
          { id: "choice-4", text: "Study it from a distance", nextSegmentId: "artifact-study" },
        ],
        theme: "futuristic",
      },
      "repair-systems": {
        id: "repair-systems",
        content: "You restore the systems, but the signal grows stronger, forcing an emergency landing on an unknown planet.",
        choices: [
          { id: "choice-5", text: "Explore the planet", nextSegmentId: "explore-planet" },
          { id: "choice-6", text: "Stay on the ship", nextSegmentId: "stay-ship" },
        ],
        theme: "futuristic",
      },
      "artifact-touch": {
        id: "artifact-touch",
        content: "The artifact grants you visions of an alien alliance, forging a new future for humanity.",
        isEnding: true,
        theme: "futuristic",
      },
      "artifact-study": {
        id: "artifact-study",
        content: "You learn the artifact’s history but trigger a defense mechanism, barely escaping alive.",
        isEnding: true,
        theme: "futuristic",
      },
      "explore-planet": {
        id: "explore-planet",
        content: "The planet is habitable, and you establish Space Colony Alpha, a new home for humanity.",
        isEnding: true,
        theme: "futuristic",
      },
      "stay-ship": {
        id: "stay-ship",
        content: "You remain on the ship, but the signal overwhelms the systems, stranding you in space.",
        isEnding: true,
        theme: "futuristic",
      },
    },
    "story-6": {
      start: {
        id: "start",
        content: "You’re in the foggy town of Black Hollow, investigating paranormal activity. The townsfolk speak of a cursed church on the hill.",
        choices: [
          { id: "choice-1", text: "Visit the church at dusk", nextSegmentId: "church-dusk" },
          { id: "choice-2", text: "Interview the townsfolk first", nextSegmentId: "townsfolk-interview" },
        ],
        theme: "horror",
      },
      "church-dusk": {
        id: "church-dusk",
        content: "The church’s stained glass glows ominously. A chilling voice whispers your name from the altar.",
        choices: [
          { id: "choice-3", text: "Approach the altar", nextSegmentId: "altar-approach" },
          { id: "choice-4", text: "Flee the church", nextSegmentId: "church-flee" },
        ],
        theme: "horror",
      },
      "townsfolk-interview": {
        id: "townsfolk-interview",
        content: "The townsfolk reveal the church’s dark past—a cult’s ritual gone wrong. They warn you of vengeful spirits.",
        choices: [
          { id: "choice-5", text: "Prepare for the church visit", nextSegmentId: "church-dusk" },
          { id: "choice-6", text: "Leave Black Hollow", nextSegmentId: "leave-town" },
        ],
        theme: "horror",
      },
      "altar-approach": {
        id: "altar-approach",
        content: "A vengeful spirit emerges, trapping you in an eternal nightmare.",
        isEnding: true,
        theme: "horror",
      },
      "church-flee": {
        id: "church-flee",
        content: "You escape the church, but the whispers follow you, a haunting you’ll never outrun.",
        isEnding: true,
        theme: "horror",
      },
      "leave-town": {
        id: "leave-town",
        content: "You leave Black Hollow, the curse untouched, but your sanity intact.",
        isEnding: true,
        theme: "horror",
      },
    },
  };

  useEffect(() => {
    const useFirstPerson = hasFeature("use_first_person_narrative");
    setNarrativeStyle(useFirstPerson ? "first-person" : "third-person");

    // Check if the story is completed
    const completed = localStorage.getItem(`story-completed-${storyId}`);
    if (completed === "true") {
      setIsCompleted(true);
    }

    loadSegment(initialSegmentId);
  }, [initialSegmentId, storyId]);

  const loadSegment = (segmentId: string) => {
    setLoading(true);

    setTimeout(() => {
      const storyData = storiesData[storyId] || {};
      const segment = storyData[segmentId];

      if (segment) {
        let content = segment.content;

        if (narrativeStyle === "first-person" && !content.startsWith("I")) {
          content = content.replace(/You /g, "I ");
          content = content.replace(/Your /g, "My ");
        } else if (narrativeStyle === "third-person" && !content.startsWith("You")) {
          content = content.replace(/I /g, "You ");
          content = content.replace(/My /g, "Your ");
        }

        setCurrentSegment({
          ...segment,
          content,
        });
      } else {
        setCurrentSegment(null);
      }

      setLoading(false);
    }, 500);
  };

  const handleChoice = (choice: Choice) => {
    setUserChoices([...userChoices, choice.id]);
    loadSegment(choice.nextSegmentId);
  };

  const handleComplete = () => {
    localStorage.setItem(`story-completed-${storyId}`, "true");
    setIsCompleted(true);
    onComplete(userChoices);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }

  if (!currentSegment) {
    return (
      <div className="text-center p-8">
        <p className="text-xl mb-6 text-red-600">Story segment not found.</p>
        <Button onClick={onExit} className="bg-secondary text-white hover:bg-secondary/90">
          Return to Stories
        </Button>
      </div>
    );
  }

  const getThemeClasses = () => {
    const themeEnabled = hasFeature("enable_dynamic_themes");

    if (!themeEnabled) return "bg-card text-foreground";

    switch (currentSegment.theme) {
      case "medieval":
        return "bg-amber-50 border-amber-300 text-amber-900 shadow-amber-200";
      case "futuristic":
        return "bg-blue-50 border-blue-300 text-blue-900 shadow-blue-200";
      case "horror":
        return "bg-red-50 border-red-300 text-red-900 shadow-red-200";
      default:
        return "bg-card text-foreground";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <StoryTheme theme={currentSegment.theme}>
        <Card className={`p-6 ${getThemeClasses()} transition-all duration-300 hover:shadow-xl`}>
          <div className="prose max-w-none mb-8">
            <NarrativeStyle content={currentSegment.content} />
          </div>

          {currentSegment.isEnding ? (
            <div className="text-center mt-8">
              <p className="text-2xl font-bold mb-6 text-yellow-600">The End</p>
              <Button
                onClick={handleComplete}
                className="mr-4 bg-green-600 text-white hover:bg-green-700"
                disabled={isCompleted}
              >
                {isCompleted ? "Completed" : "Complete Story"}
              </Button>
              <Button
                variant="outline"
                onClick={onExit}
                className="border-secondary text-black text-secondary hover:bg-secondary/20"
              >
                Return to Stories
              </Button>
            </div>
          ) : (
            <div className="space-y-6 mt-8">
              <p className="font-semibold text-lg">What will you do next?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSegment.choices?.map((choice) => (
                  <Button
                    key={choice.id}
                    variant="outline"
                    className="justify-start text-left py-6 px-8 hover:bg-accent/50 transition-colors duration-200 text-base"
                    onClick={() => handleChoice(choice)}
                  >
                    {choice.text}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </StoryTheme>
    </div>
  );
};

export default StoryReader;