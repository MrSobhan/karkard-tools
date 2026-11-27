"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyButton({ text, label = "کپی نتیجه", disabled }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };
  return (
    <Button onClick={copy} disabled={disabled} aria-live="polite">
      {done ? <Check className="size-4 text-success" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {done ? "کپی شد" : label}
    </Button>
  );
}
