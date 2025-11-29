"use client";
import { getClientT } from "@/lib/i18n/client";
import introduceImage1 from "@/assets/introduction1.png";
import introduceImage2 from "@/assets/introduction2.png";
import Image from 'next/image';
export default function Introduction() {
  const t = getClientT();
  return (
    <div>
      <section className="container mx-auto px-[150px] py-8">
        <div className="relative md:min-h-[420px]">
          {/* Base image aligned left, visible under content */}
          <Image
            src={introduceImage1}
            alt="Introduction"
            className="w-[100%] object-cover shadow-md z-0"
          />
          {/* Content overlay aligned right, white background, 2/5 width, drop ~50px */}
          <div className="absolute left-[60%] top-12 w-[50%] bg-white shadow-lg p-14 z-10">
            <div>
              <h2 className="font-playfair text-3xl font-semibold mb-4 tracking-tight text-primary">
                {t("intro.masterpiece.title")}
              </h2>
              <h2 className="font-playfair font-bold mb-6 tracking-tight text-[#D4AF37]">
                {t("intro.private.title")}
              </h2>
            </div>
            <p className="font-poppins text-base mb-6 opacity-90">{t("intro.p1")}</p>
            <p className="font-poppins text-base opacity-90">{t("intro.p2")}</p>
          </div>
          {/* Mobile fallback: stacked layout */}
          <div className="md:hidden">
            <Image
              src={introduceImage1}
              alt="Introduction"
              className="w-full h-80 object-cover rounded-lg mb-4"
            />
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="font-playfair text-2xl font-bold mb-3 tracking-tight">
                {t("intro.mobile.masterpiece")}
              </h2>
              <h2 className="font-playfair text-xl font-bold mb-4 tracking-tight">
                {t("intro.mobile.private")}
              </h2>
              <p className="font-poppins text-base mb-4 opacity-90">{t("intro.mobile.p1")}</p>
              <p className="font-poppins text-base opacity-90">{t("intro.mobile.p2")}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-primary text-white">
        <div className="flex flex-row items-stretch">
          <div className="flex flex-col w-[50%] p-20">
            <h2 className="font-playfair text-3xl font-bold mb-4 tracking-tight text-white">
              {t("intro.refined.title")}
            </h2>
            <p className="font-poppins text-base mb-6 opacity-90">{t("intro.refined.p1")}</p>
            <p className="font-poppins text-base mb-6 opacity-90">{t("intro.refined.p2")}</p>
            <p className="self-end font-poppins text-base mb-6 opacity-90">{t("intro.refined.tagline")}</p>
          </div>
          <div className="w-[50%] ">
              <Image
                src={introduceImage2}
                alt="Introduction"
                className="w-full h-full object-cover shadow-md z-0"
              />
          </div>
        </div>
      </section>
    </div>
  );
}
