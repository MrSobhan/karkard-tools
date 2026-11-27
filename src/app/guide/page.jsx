import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { RULES } from "@/lib/work-rules";
import { formatTime, toFa } from "@/lib/time";

export const metadata = { title: "راهنما", description: "قوانین محاسبه‌ی کارکرد: حضور موظف، شناوری، تعجیل و پیشنهاد مرخصی ساعتی." };

const f = (m) => toFa(formatTime(m));

export default function GuidePage() {
  const items = [
    ["حضور موظف", `هر روز باید ${f(RULES.requiredMinutes)} از ورود تا خروج در شرکت باشید. خروج موظف = ورود + ${f(RULES.requiredMinutes)}. مثلاً ورود ${f(8 * 60)} ← خروج ${f(16 * 60 + 45)}.`],
    ["ساعت رسمی و شناوری", `ساعت رسمی ${f(RULES.officialStart)} تا ${f(RULES.officialEnd)} است و واحد نرم‌افزار ${f(RULES.flexMinutes)} شناوری دارد. ورود زودتر از ${f(RULES.officialStart)} برای محاسبه‌ی خروج موظف، ${f(RULES.officialStart)} حساب می‌شود.`],
    ["تأخیر", `آخرین ساعت ورود ${f(RULES.latestEntry)} است. ورود بعد از آن تأخیر دارد و مقدار تأخیر = ورود − ${f(RULES.latestEntry)}.`],
    ["مازاد", "اگر بعد از خروج موظف بمانید، اختلاف آن مازاد حساب می‌شود."],
    ["تعجیل", `فقط وقتی ثبت می‌شود که قبل از ${f(RULES.officialEnd)} بروید؛ مقدار آن فاصله‌ی خروج تا ${f(RULES.officialEnd)} است.`],
    ["پیشنهاد مرخصی ساعتی", `اگر بعد از ${f(RULES.officialEnd)} ولی قبل از خروج موظف بروید، تعجیل ندارید ولی بهتر است برای باقی‌مانده مرخصی ساعتی ثبت کنید. مثال: ورود ${f(8 * 60)} و خروج ${f(16 * 60 + 30)} ← ${toFa(15)} دقیقه مرخصی از ${f(16 * 60 + 30)} تا ${f(16 * 60 + 45)}.`],
  ];
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader title="راهنمای قوانین" description="این ابزارها فقط کمک‌محاسبه‌اند؛ مرجع نهایی همان سامانه‌ی چارگون و مقررات شرکت است." />
        <dl className="flex flex-col gap-4">
          {items.map(([t, d]) => (
            <div key={t} className="rounded-xl border border-border bg-background/50 p-4">
              <dt className="mb-1 font-bold">{t}</dt>
              <dd className="text-sm leading-7 text-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted-foreground">همه‌چیز روی دستگاه شما انجام می‌شود و هیچ داده‌ای به بیرون ارسال نمی‌شود.</p>
      </Card>
      <Link href="/" className="text-sm text-primary underline-offset-4 hover:underline">
        بازگشت به ابزارها
      </Link>
    </div>
  );
}
