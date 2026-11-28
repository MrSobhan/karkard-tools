import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { RULES } from "@/lib/work-rules";
import { formatTime, toFa } from "@/lib/time";

export const metadata = {
  title: "راهنما",
  description: "قوانین محاسبه‌ی کارکرد: حضور موظف، شناوری، تعجیل و پیشنهاد مرخصی ساعتی.",
};

const formatMinutes = (minutes) => toFa(formatTime(minutes));

const RULE_ITEMS = [
  {
    title: "حضور موظف",
    description: `هر روز باید ${formatMinutes(RULES.requiredMinutes)} از ورود تا خروج در شرکت باشید. خروج موظف = ورود + ${formatMinutes(RULES.requiredMinutes)}. مثلاً ورود ${formatMinutes(8 * 60)} ← خروج ${formatMinutes(16 * 60 + 45)}.`,
  },
  {
    title: "ساعت رسمی و شناوری",
    description: `ساعت رسمی ${formatMinutes(RULES.officialStart)} تا ${formatMinutes(RULES.officialEnd)} است و واحد نرم‌افزار ${formatMinutes(RULES.flexMinutes)} شناوری دارد. ورود زودتر از ${formatMinutes(RULES.officialStart)} برای محاسبه‌ی خروج موظف، ${formatMinutes(RULES.officialStart)} حساب می‌شود.`,
  },
  {
    title: "تأخیر",
    description: `آخرین ساعت ورود ${formatMinutes(RULES.latestEntry)} است. ورود بعد از آن تأخیر دارد و مقدار تأخیر = ورود − ${formatMinutes(RULES.latestEntry)}.`,
  },
  {
    title: "مازاد",
    description: "اگر بعد از خروج موظف بمانید، اختلاف آن مازاد حساب می‌شود.",
  },
  {
    title: "تعجیل",
    description: `فقط وقتی ثبت می‌شود که قبل از ${formatMinutes(RULES.officialEnd)} بروید؛ مقدار آن فاصله‌ی خروج تا ${formatMinutes(RULES.officialEnd)} است.`,
  },
  {
    title: "پیشنهاد مرخصی ساعتی",
    description: `اگر بعد از ${formatMinutes(RULES.officialEnd)} ولی قبل از خروج موظف بروید، تعجیل ندارید ولی بهتر است برای باقی‌مانده مرخصی ساعتی ثبت کنید. مثال: ورود ${formatMinutes(8 * 60)} و خروج ${formatMinutes(16 * 60 + 30)} ← ${toFa(15)} دقیقه مرخصی از ${formatMinutes(16 * 60 + 30)} تا ${formatMinutes(16 * 60 + 45)}.`,
  },
];

export default function GuidePage() {
  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader
          title="راهنمای قوانین"
          description="این ابزارها فقط کمک‌محاسبه‌اند؛ مرجع نهایی همان سامانه‌ی چارگون و مقررات شرکت است."
        />
        <dl className="flex flex-col gap-3">
          {RULE_ITEMS.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-background/50 p-4 transition-colors hover:border-border-strong"
            >
              <dt className="mb-1.5 font-bold">{item.title}</dt>
              <dd className="text-sm leading-7 text-muted-foreground">{item.description}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden />
          همه‌چیز روی دستگاه شما انجام می‌شود و هیچ داده‌ای به بیرون ارسال نمی‌شود.
        </div>
      </Card>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-primary transition-opacity hover:opacity-80"
      >
        <ArrowRight className="size-4" aria-hidden />
        بازگشت به ابزارها
      </Link>
    </div>
  );
}
