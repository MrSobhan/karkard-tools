import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

export const metadata = {
  title: { default: "ابزارهای کارکرد", template: "%s | ابزارهای کارکرد" },
  description:
    "ابزارهای ساده برای محاسبه‌ی ورود و خروج، مازاد، تعجیل، تأخیر و پیشنهاد مرخصی ساعتی و ثبت راحت‌تر کارکرد در چارگون.",
};

export const viewport = {
  themeColor: "#6d5efc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
          >
            پرش به محتوا
          </a>
          <header className="mx-auto flex max-w-[960px] items-center justify-between gap-3 px-4 pt-6 pb-5">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
              <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
                <Clock className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-lg leading-tight font-extrabold">ابزارهای کارکرد</span>
                <span className="block text-xs text-muted-foreground">ثبت راحت‌تر کارکرد در چارگون</span>
              </span>
            </Link>
            <nav className="flex items-center gap-2" aria-label="ناوبری اصلی">
              <Link
                href="/guide"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm transition-all hover:bg-muted hover:border-border-strong"
              >
                <BookOpen className="size-4" aria-hidden />
                راهنما
              </Link>
              <ThemeToggle />
            </nav>
          </header>
          <main id="main" className="mx-auto max-w-[960px] px-4 pb-20">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
