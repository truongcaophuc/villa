"use client";
import healingImage1 from "@/assets/healing1.png";
import healingImage2 from "@/assets/healing2.png";
import Image from 'next/image';
import { getClientT } from "@/lib/i18n/client";
export default function Healing() {
  const t = getClientT();
  return (
    <section className="px-10 py-20">
      <div className="flex flex-row items-center relative">
        <div className="w-[30%] -translate-y-12">
          <Image
            src={healingImage1}
            alt="Healing"
            className="w-full shadow-md z-0"
          />
        </div>

        <div className="flex flex-col w-[40%] p-20">
          <h2 className="font-playfair text-4xl font-bold mb-4 tracking-tight text-primary">
            {t("healing.title")}
          </h2>
          <p className="font-poppins text-base mb-6 opacity-90">
            {t("healing.p1")}
          </p>
          <p className="self-end font-poppins text-base mb-6 opacity-90">
            {t("healing.p2")}
          </p>
        </div>

        <div className="w-[30%] translate-y-12">
          <Image
            src={healingImage2}
            alt="Healing"
            className="w-full object-cover shadow-md z-0"
          />
        </div>
      </div>
    </section>
  );
}
