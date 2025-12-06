"use client";

import { useState } from "react";
import { GlobalStyles, LandingPage, SketchConverter } from "@/app/components";

type ViewType = "landing" | "sketch-converter";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("landing");

  return (
    <>
      <GlobalStyles />
      {currentView === "landing" ? (
        <LandingPage onNavigateToTool={() => setCurrentView("sketch-converter")} />
      ) : (
        <SketchConverter onBack={() => setCurrentView("landing")} />
      )}
    </>
  );
}

