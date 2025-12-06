"use client";

import { useRef } from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import Footer from "./Footer";

interface LandingPageProps {
  onNavigateToTool: () => void;
}

export default function LandingPage({ onNavigateToTool }: LandingPageProps) {
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
      status: "coming-soon" as const,
      action: null,
    },
    {
      id: "bubble-editor",
      title: "Chat Bubble Editor",
      subtitle: "吹き出し編集",
      description:
        "Add speech bubbles, thought clouds, and text boxes with authentic manga typography and styles.",
      icon: "💬",
      status: "coming-soon" as const,
      action: null,
    },
    {
      id: "collage-maker",
      title: "Collage Maker",
      subtitle: "コラージュ作成",
      description:
        "Combine multiple panels and scenes into stunning manga page layouts with dynamic compositions.",
      icon: "🖼️",
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
