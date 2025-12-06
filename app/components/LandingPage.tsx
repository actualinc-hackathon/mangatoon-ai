"use client";

import { useRef } from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import Footer from "./Footer";

interface LandingPageProps {
  onNavigateToTool: () => void;
  onNavigateToCharacterInserter: () => void;
  onNavigateToCollageEditor: () => void;
}

export default function LandingPage({
  onNavigateToTool,
  onNavigateToCharacterInserter,
  onNavigateToCollageEditor,
}: LandingPageProps) {
  const featuresRef = useRef<HTMLElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      id: "sketch-converter",
      title: "Manga Sketch",
      subtitle: "スケッチ変換",
      description:
        "Transform any photo into authentic manga-style background artwork. AI removes text, logos & ads, then converts to beautiful sketch style.",
      icon: "🎨",
      status: "available" as const,
      action: onNavigateToTool,
    },
    {
      id: "character-studio",
      title: "Add Characters",
      subtitle: "キャラ追加",
      description:
        "Add or upload your own manga characters to your scenes. Position and scale them perfectly in your artwork.",
      icon: "👤",
      status: "available" as const,
      action: onNavigateToCharacterInserter,
    },
    {
      id: "manga-studio",
      title: "Manga Studio",
      subtitle: "マンガスタジオ",
      description:
        "Create stunning manga pages with multiple images, speech bubbles, text, and frames. Build complete manga panels with professional layouts and styling.",
      icon: "✨",
      status: "available" as const,
      action: onNavigateToCollageEditor,
    },
    {
      id: "character-creation",
      title: "Character Creation",
      subtitle: "キャラクター作成",
      description:
        "Transform real photos into animated manga characters! Upload your image and convert it to black & white manga style. Perfect for creating your own character or testing with any image.",
      icon: "🎭",
      status: "coming-soon" as const,
      action: null,
    },
  ];

  return (
    <main style={{ minHeight: "100vh" }}>
      <Navbar
        onScrollToFeatures={scrollToFeatures}
        onLaunchApp={onNavigateToTool}
      />
      <HeroSection
        onStartCreating={onNavigateToTool}
        onScrollToFeatures={scrollToFeatures}
      />
      <FeaturesSection ref={featuresRef} features={features} />
      <HowItWorksSection />
      <Footer />
    </main>
  );
}
