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
        "Transform any photo into authentic manga-style artwork. AI removes text, logos & ads, then converts to beautiful sketch style.",
      icon: "✏️",
      status: "available" as const,
      action: onNavigateToTool,
    },
    {
      id: "panel-creator",
      title: "Panel Creator",
      subtitle: "パネル作成",
      description:
        "Create dynamic manga panels with speech bubbles, effects, and authentic Japanese typography.",
      icon: "💬",
      status: "coming-soon" as const,
      action: null,
    },
    {
      id: "character-gen",
      title: "Character Gen",
      subtitle: "キャラ生成",
      description:
        "Generate original manga characters with customizable styles, expressions, and poses.",
      icon: "👤",
      status: "coming-soon" as const,
      action: null,
    },
    {
      id: "effect-studio",
      title: "Effect Studio",
      subtitle: "効果スタジオ",
      description:
        "Add speed lines, impact frames, screentones, and iconic manga effects to any image.",
      icon: "💥",
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

