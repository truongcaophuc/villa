import viCommon from "../../../public/locales/vi/common.json";
import enCommon from "../../../public/locales/en/common.json";

export function getClientT() {
  const cookie = typeof document !== "undefined" ? document.cookie : "";
  const m = cookie.match(/NEXT_LOCALE=([^;]+)/);
  const lng = m && m[1] && m[1].startsWith("en") ? "en" : "vi";
  const dict = lng === "en" ? (enCommon as Record<string, string>) : (viCommon as Record<string, string>);
  return (key: string) => dict[key] || key;
}
