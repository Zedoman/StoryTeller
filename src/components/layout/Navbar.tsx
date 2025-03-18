import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Flag, Settings, Wrench } from "lucide-react";
import { Button } from "../ui/button";
import { useFlagsmith } from "@/contexts/FlagsmithContext";

const Navbar = () => {
  const { hasFeature } = useFlagsmith();
  const isAdmin = hasFeature("is_admin");

  return (
    <nav className="flex items-center space-x-4 ml-8">
      <Link to="/" className="flex items-center space-x-2">
        <BookOpen className="h-5 w-5" />
        <span>Stories</span>
      </Link>

      <Link to="/feature-flags" className="flex items-center space-x-2">
        <Flag className="h-5 w-5" />
        <span>Feature Flags</span>
      </Link>

      {isAdmin && (
        <Link to="/admin">
          <Button variant="ghost" className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Admin</span>
          </Button>
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
