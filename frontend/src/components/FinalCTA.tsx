"use client";
import { getClientT } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import ctaImage from "@/assets/cta.jpg";
import Image from 'next/image';

export const FinalCTA = () => {
  const t = getClientT();
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={ctaImage}
          alt="Luxury villa bedroom with ocean view"
          className="w-full h-full object-cover"
        />
        {/* <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" /> */}
      </div>

      {/* Content */}
      <div className="flex flex-col px-4 relative z-10 items-center">
        <div className="flex flex-col items-center w-[80%] animate-fade-in-up text-primary-foreground">
          <h2 className="font-playfair text-4xl md:text-6xl font-bold mb-6 text-center">
            {t("cta.title")}
          </h2>
          <Button
            variant="hero"
            size="lg"
            className="font-poppins text-lg px-8 py-6"
            onClick={() => window.open("https://www.instagram.com/danangvilla05/", "_blank")}
          >
            {t("cta.button")}
          </Button>
        </div>
      </div>
    </section>
  );
};
