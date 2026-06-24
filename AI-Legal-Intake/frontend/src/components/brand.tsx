import { Scale } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Brand({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 group ${className}`}
    >
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-[0_4px_20px_-4px_var(--ring)]">
        <Scale className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.4} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg text-foreground">Lex Triage</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Legal Operations
        </span>
      </span>
    </Link>
  );
}