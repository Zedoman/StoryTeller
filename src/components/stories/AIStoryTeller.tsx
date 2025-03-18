import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, X, Volume2, Pause, Play } from "lucide-react"; // Added audio-related icons
import { Input } from "@/components/ui/input";

const AIStoryTeller: React.FC = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "ai"; message: string; theme?: "medieval" | "futuristic" | "horror" }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // State to toggle chat visibility
  const [isSpeaking, setIsSpeaking] = useState(false); // State to track speech status
  const chatEndRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null); // Ref to control speech

  // Scroll to the latest message when chat history updates
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isChatOpen]);

  // Cleanup speech synthesis when chat closes
  useEffect(() => {
    if (!isChatOpen && utteranceRef.current) {
      window.speechSynthesis.cancel(); // Stop speech when chat is closed
      setIsSpeaking(false);
    }
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isChatOpen]);

  // Toggle chat window visibility
  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  // Toggle speech play/pause
  const toggleSpeech = () => {
    if (!utteranceRef.current) return;

    if (isSpeaking) {
      window.speechSynthesis.pause();
    } else {
      window.speechSynthesis.resume();
    }
    setIsSpeaking(!isSpeaking);
  };

  // Generate a story using Grok API and read it aloud
  const generateStory = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setChatHistory((prev) => [...prev, { role: "user", message }]);

    try {
      const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "your-api-key-here";
      if (!GROQ_API_KEY || GROQ_API_KEY === "your-api-key-here") {
        throw new Error("GROQ_API_KEY is not set. Please configure it in your .env file.");
      }

      const systemPrompt = `You are a creative storyteller. Generate a concise, creative story (150-200 words) based on the user's prompt. Ensure the story has a clear setting, challenge, and resolution. Assign a theme (medieval, futuristic, or horror) that fits the story's tone, and include the theme in the response (e.g., 'Theme: medieval').`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192", // Updated to a valid Groq model
          messages: [
            { role: "system", "content": systemPrompt },
            { role: "user", "content": message },
          ],
          max_tokens: 300,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch story from Grok API: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedStory = data.choices[0]?.message?.content || "Sorry, I couldn’t generate a story right now.";

      let theme: "medieval" | "futuristic" | "horror" = "medieval";
      if (generatedStory.includes("Theme: futuristic")) {
        theme = "futuristic";
      } else if (generatedStory.includes("Theme: horror")) {
        theme = "horror";
      }
      const storyContent = generatedStory.replace(/Theme: (medieval|futuristic|horror)\n?/, "").trim();

      setChatHistory((prev) => [...prev, { role: "ai", message: storyContent, theme }]);

      // Initiate text-to-speech
      if (window.speechSynthesis && storyContent !== "Sorry, I couldn’t generate a story right now.") {
        window.speechSynthesis.cancel(); // Cancel any previous speech
        const utterance = new SpeechSynthesisUtterance(storyContent);
        utterance.lang = "en-US"; // Set language (adjust as needed)
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.onend = () => setIsSpeaking(false); // Reset speaking state when done
        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event.error);
          setIsSpeaking(false);
        };
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } catch (error) {
      console.error("Error generating story:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", message: `Sorry, I couldn’t generate a story right now. Error: ${error.message}. Try again later!`, theme: "medieval" },
      ]);
    } finally {
      setMessage("");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      generateStory();
    }
  };

  const themeColors = {
    medieval: "bg-amber-100 text-amber-800",
    futuristic: "bg-blue-100 text-blue-800",
    horror: "bg-red-100 text-red-800",
  };

  return (
    <div>
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors z-50"
        aria-label="Toggle chatbot"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Chatbot Modal (visible when isChatOpen is true) */}
      {isChatOpen && (
        <div className="fixed bottom-16 right-4 w-80 sm:w-96 z-50">
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border shadow-lg">
            <CardHeader className="relative">
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI Storyteller
              </CardTitle>
              <CardDescription className="text-sm">
                Ask for a story (e.g., "Tell me a story about a brave adventurer")
              </CardDescription>
              {/* Close Button */}
              <button
                onClick={toggleChat}
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-primary"
                aria-label="Close chatbot"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64 overflow-y-auto border rounded-md p-3 bg-card">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}
                  >
                    <span
                      className={`inline-block p-2 rounded-md ${
                        msg.role === "user"
                          ? "bg-blue-100 text-blue-800"
                          : `${themeColors[msg.theme || "medieval"]} prose`
                      } max-w-[85%]`}
                    >
                      {msg.role === "user" ? (
                        msg.message
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.message}</div>
                      )}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask for a story..."
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button onClick={generateStory} disabled={isLoading} size="sm">
                  <Send className="h-4 w-4 mr-1" />
                  {isLoading ? "Crafting..." : "Send"}
                </Button>
                {chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === "ai" && (
                  <Button
                    onClick={toggleSpeech}
                    size="sm"
                    variant={isSpeaking ? "destructive" : "default"}
                    className="ml-2"
                    aria-label={isSpeaking ? "Pause narration" : "Play narration"}
                  >
                    {isSpeaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIStoryTeller;