import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = ["en", "es", "fr"].includes(savedLocale ?? "") ? savedLocale : "en";
  redirect(`/${locale}`);
}
