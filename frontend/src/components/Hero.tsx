"use client";
import { getClientT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/banner.png";
import Image from 'next/image';
export const Hero = () => {
  const t = getClientT();
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Luxury beachfront villa with infinity pool in Da Nang"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-secondary/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
        <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in-up tracking-tight">
          {t("hero.title")}
        </h1>
        <div className="flex justify-center items-center gap-20 text-2xl mb-10">
          <div>VILLAS</div>
          <div>BEACH</div>
          <div>IN</div>
          <div>DA NANG</div>
        </div>
        <p className="font-playfair text-2xl md:text-3xl lg:text-4xl mb-4 animate-fade-in italic">
          {t("hero.subtitle")}
        </p>
        {/* <p className="font-poppins text-lg md:text-xl max-w-3xl mx-auto mb-12 animate-fade-in opacity-90">
          Tận hưởng kỳ nghỉ tại beachfront villa Đà Nẵng với hồ bơi riêng, phòng rộng, dịch vụ chuẩn 5 sao.
        </p> */}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
          <Button
            variant="hero"
            size="lg"
            className="font-poppins text-lg px-8 py-6"
            onClick={() => scrollToSection("discover")}
          >
            {t("hero.discover")}
          </Button>
        </div>

        {/* Scroll Indicator */}
        {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-primary-foreground rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary-foreground rounded-full mt-2 animate-pulse" />
          </div>
        </div> */}
      </div>
    </section>
  );
};
