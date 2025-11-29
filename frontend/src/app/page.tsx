'use client';
import { Hero } from "@/components/Hero";
import { FinalCTA } from "@/components/FinalCTA";
import SocialMedia from "@/components/SocialMedia";
import Introduction from "@/components/Introduction";
import Healing from "@/components/Healing";
import Villa from "@/components/Villa";
import Discover from "@/components/Discover";
const Index = () => {
  return (
    <div className="min-h-screen bg-background font-poppins">
      <div id="hero">
        <Hero  />
      </div>
      <Introduction />
      <Healing />
      <div id="discover">
        <Discover />
      </div>
      <div id="villas">
        <Villa />
      </div>
      <FinalCTA />
      <SocialMedia />
    </div>
  );
};

export default Index;
