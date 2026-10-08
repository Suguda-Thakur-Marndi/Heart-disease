import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HeartGuard — Heart Disease Risk Prediction",
  description:
    "Assess cardiovascular risk using a machine-learning model trained on clinical health indicators.",
  keywords: [
    "Heart disease prediction",
    "Cardiovascular risk assessment",
    "Machine learning healthcare",
    "HeartGuard",
    "Clinical AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('heartguard_theme');
                if (storedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-full flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-300 relative selection:bg-emerald-500/25 selection:text-emerald-900 dark:selection:text-emerald-200`}
      >
        {/* Fixed Medical Heart Graphic Background (Crystal clear and unblurred) */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-20 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-500"
          style={{ backgroundImage: "url('/heart-bg.png')" }}
        />
        {/* Transparent Theme Wash: Translucent white/emerald in light mode, deep dark emerald in dark mode */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 pointer-events-none bg-white/15 dark:bg-[#030d07]/80 transition-colors duration-300"
        />

        {children}
      </body>
    </html>
  );
}
