import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "fr"],
  defaultLocale: "en",
  localePrefix: "always", // always include /en/ /fr/ /es/ in URL — keeps switchLocale() reliable
});
