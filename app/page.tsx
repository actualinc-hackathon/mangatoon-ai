"use client";

import { useState, useEffect } from "react";
import {
  GlobalStyles,
  LandingPage,
  SketchConverter,
  CharacterInserter,
  CollageEditor,
} from "@/app/components";

type ViewType =
  | "landing"
  | "sketch-converter"
  | "character-inserter"
  | "collage-editor";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("landing");

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const view = (event.state?.view || "landing") as ViewType;
      setCurrentView(view);
    };

    // Listen for browser back/forward
    window.addEventListener("popstate", handlePopState);

    // Initialize with current URL hash or default to landing
    const hash = window.location.hash.slice(1);
    if (
      hash &&
      ["sketch-converter", "character-inserter", "collage-editor"].includes(
        hash
      )
    ) {
      setCurrentView(hash as ViewType);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigateToView = (view: ViewType) => {
    setCurrentView(view);
    // Push to browser history
    window.history.pushState({ view }, "", `#${view}`);
  };

  const navigateBack = () => {
    setCurrentView("landing");
    // Push landing to history
    window.history.pushState({ view: "landing" }, "", "#landing");
  };

  const renderView = () => {
    switch (currentView) {
      case "sketch-converter":
        return <SketchConverter onBack={navigateBack} />;
      case "character-inserter":
        return <CharacterInserter onBack={navigateBack} />;
      case "collage-editor":
        return <CollageEditor onBack={navigateBack} />;
      default:
        return (
          <LandingPage
            onNavigateToTool={() => navigateToView("sketch-converter")}
            onNavigateToCharacterInserter={() =>
              navigateToView("character-inserter")
            }
            onNavigateToCollageEditor={() => navigateToView("collage-editor")}
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
