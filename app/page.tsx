"use client";

import { useState } from "react";
import { GlobalStyles, LandingPage, SketchConverter, CharacterInserter } from "@/app/components";

type ViewType = "landing" | "sketch-converter" | "character-inserter";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("landing");

  const renderView = () => {
    switch (currentView) {
      case "sketch-converter":
        return <SketchConverter onBack={() => setCurrentView("landing")} />;
      case "character-inserter":
        return <CharacterInserter onBack={() => setCurrentView("landing")} />;
      default:
        return (
          <LandingPage
            onNavigateToTool={() => setCurrentView("sketch-converter")}
            onNavigateToCharacterInserter={() => setCurrentView("character-inserter")}
          />
        );
    }
  };

  return (
    <>
      <GlobalStyles />
      {renderView()}
    </>
  );
}

