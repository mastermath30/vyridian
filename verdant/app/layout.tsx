import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vyridian — Personal Finance & Sustainability",
  description:
    "Understand your spending, protect your financial goals, and make more sustainable choices — powered by Claude AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('verdant_profile');
                if (t) {
                  var p = JSON.parse(t);
                  if (p.theme) document.documentElement.setAttribute('data-theme', p.theme);
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
