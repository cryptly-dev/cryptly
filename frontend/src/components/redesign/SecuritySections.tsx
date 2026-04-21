import { cn } from "@/lib/utils";
import { Database } from "lucide-react";
import { useMemo } from "react";
import { fakeCiphertext, SectionShell } from "./common";

function SectionTitle({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-neutral-400">{subtitle}</p>
      )}
    </div>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-900 bg-neutral-950/60",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CryptlyOnCryptlySection() {
  const dump = useMemo(
    () => fakeCiphertext("cryptly-on-cryptly-prod", 1200),
    []
  );

  return (
    <SectionShell>
      <SectionTitle
        title="This is what a breach of our servers would publish."
        subtitle={
          <>
            An example of what our database actually stores for a project's
            secrets. One opaque blob, encrypted in your browser before it ever
            left it.{" "}
            <a
              href="https://cryptly.dev/blog/how-encryption-works"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-200 underline decoration-neutral-700 underline-offset-4 hover:decoration-neutral-400"
            >
              Read how our encryption works →
            </a>
          </>
        }
      />
      <div className="mt-20 md:mt-24 max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-900 text-xs">
            <div className="flex items-center gap-2 text-neutral-400">
              <Database className="h-3.5 w-3.5" />
              <span className="font-mono">Some project</span>
            </div>
          </div>
          <div className="relative">
            <div
              className="p-5 md:p-6 font-mono text-[11px] md:text-[12px] leading-5 text-neutral-500 break-all overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {dump}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-neutral-950/80 to-transparent" />
            <div className="px-5 pb-3 text-[11px] text-neutral-600 flex items-center gap-1">
              truncated for your eyes
            </div>
          </div>
        </Card>
      </div>
    </SectionShell>
  );
}
