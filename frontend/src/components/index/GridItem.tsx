import { GlowingEffect } from "@/components/ui/glowing-effect";

interface GridItemProps {
  area: string;
  icon?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  iconBgColor?: string;
  iconBorderColor?: string;
}

export const GridItem = ({
  area,
  icon,
  title,
  description,
  iconBgColor = "bg-green-600/10",
  iconBorderColor = "border-green-900/80",
}: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border border-neutral-800/80 p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-neutral-900/50 backdrop-blur p-6 md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            {icon && (
              <div
                className={`w-fit rounded-lg border ${iconBorderColor} ${iconBgColor} p-2`}
              >
                {icon}
              </div>
            )}
            <div className="space-y-3">
              <h3 className="font-sans text-xl font-semibold text-white md:text-2xl">
                {title}
              </h3>
              <div className="font-sans text-sm text-neutral-400 md:text-base">
                {description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
