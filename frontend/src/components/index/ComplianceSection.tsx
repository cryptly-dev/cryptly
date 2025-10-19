import { motion } from "motion/react";
import { CloudUpload, Lock, Plug, Shield, Terminal, Zap } from "lucide-react";
import { GridItem } from "./GridItem";

interface PainPoint {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface Solution {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const painPoints: PainPoint[] = [
  {
    icon: Terminal,
    title: '"Just copy-paste the API key"',
    description:
      "Slack DMs, email threads, and shared docs become your secret vault. Until someone screenshots it.",
  },
  {
    icon: CloudUpload,
    title: "Deploy → Update 47 places → Repeat",
    description:
      "Manually updating secrets across GitHub Actions, Vercel, AWS, and every other platform. Every. Single. Time.",
  },
  {
    icon: Zap,
    title: "$50,000 AWS bill surprise",
    description: "That leaked API key just auto-scaled your nightmare.",
  },
];

const solutions: Solution[] = [
  {
    icon: Lock,
    title: "Share secrets like a pro",
    description:
      'Encrypted sharing that works. No more "can you send me that key again?" messages at 2 AM.',
  },
  {
    icon: Plug,
    title: "One click, everywhere updated",
    description:
      "Push to GitHub Actions, Vercel, and more with a single button. Your deployment pipeline just got smarter.",
  },
  {
    icon: Shield,
    title: "Sleep better at night",
    description:
      "Zero-knowledge encryption means even we can't see your secrets. No more unexpected bills.",
  },
];

export function ComplianceSection() {
  return (
    <section className="relative md:py-24 py-8 px-6 max-w-5xl mx-auto">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: [0, 1, 0, 1] }}
        >
          <h2 className="text-3xl font-bold text-white md:text-5xl mb-4">
            Stop{" "}
            <span className="relative inline-block">
              <span className=" decoration-red-600 decoration-2 underline-offset-4">
                firefighting
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-red-600/10 blur-sm -z-10" />
            </span>{" "}
            secrets disasters
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            You deserve better than Slack DMs and .env labor work
          </p>
        </motion.div>

        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-1 lg:gap-4">
          {/* Before Container */}
          <GridItem
            area="md:[grid-area:1/1/2/7]"
            title="Managing secrets manually"
            description={
              <div className="space-y-4 mt-4">
                {painPoints.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="mt-1 rounded-lg bg-red-600/10 border border-red-600/20 p-2">
                        <IconComponent className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-foreground text-lg mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm font-light text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          />

          {/* After Container */}
          <GridItem
            area="md:[grid-area:1/7/2/13]"
            title="Using Cryptly"
            description={
              <div className="space-y-4 mt-4">
                {solutions.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="mt-1 rounded-lg bg-green-600/10 border border-green-600/20 p-2">
                        <IconComponent className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-foreground text-lg mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          />
        </ul>
      </div>
    </section>
  );
}
