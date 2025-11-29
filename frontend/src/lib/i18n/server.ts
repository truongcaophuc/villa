import i18next, { i18n } from "i18next";
import { cookies } from "next/headers";
import viCommon from "../../../public/locales/vi/common.json";
import enCommon from "../../../public/locales/en/common.json";

export async function getServerT(locale?: string): Promise<(key: string) => string> {
  const c = await cookies();
  const cookieLocale = c.get("NEXT_LOCALE")?.value;
  const lng = (locale || cookieLocale || "vi").startsWith("en") ? "en" : "vi";
  const resources = {
    vi: { common: viCommon as Record<string, string> },
    en: { common: enCommon as Record<string, string> },
  };
  const inst: i18n = i18next.createInstance();
  await inst.init({ lng, resources, fallbackLng: "vi", ns: ["common"], defaultNS: "common" });
  return (key: string) => inst.t(key);
}
