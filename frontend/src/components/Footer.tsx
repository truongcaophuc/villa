"use client";
import { getClientT } from "@/lib/i18n/client";
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from "lucide-react";

export const Footer = () => {
  const t = getClientT();
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-playfair text-2xl font-bold mb-4">{t("footer.brand")}</h3>
            <p className="font-poppins text-sm opacity-90">{t("footer.brand.desc")}</p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-playfair text-xl font-semibold mb-4">{t("footer.contact")}</h4>
            <div className="space-y-3 font-poppins text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+84 905 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>booking@villadanang.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng</span>
              </div>
            </div>
          </div>

          {/* Social & Quick Links */}
          <div>
            <h4 className="font-playfair text-xl font-semibold mb-4">{t("footer.connect")}</h4>
            <div className="flex gap-4 mb-6">
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Zalo"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
            <div className="font-poppins text-sm">
              <p className="mb-2">{t("footer.hours")}</p>
              <p className="opacity-90">{t("footer.hours.value")}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8 text-center font-poppins text-sm opacity-75">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};
