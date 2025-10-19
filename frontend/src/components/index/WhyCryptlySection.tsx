import { motion } from "motion/react";
import { KeyRound, Lock, Shield, Users, Zap } from "lucide-react";
import { GridItem } from "./GridItem";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  area: string;
}

const features: Feature[] = [
  {
    icon: Lock,
    title: "End-to-end encryption",
    description:
      "All encryption happens in your browser. We never see your actual secrets - it's mathematically impossible for us to decrypt them.",
    area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
  },
  {
    icon: KeyRound,
    title: "Local key generation",
    description:
      "Your cryptographic keys are generated locally in your browser. Your private key never leaves your device in plaintext.",
    area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
  },
  {
    icon: Shield,
    title: "Passphrase protected",
    description:
      "Your private key is encrypted with your passphrase using AES-256-GCM. Even if someone accesses your encrypted key, it's useless without your passphrase.",
    area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
  },
  {
    icon: Users,
    title: "Secure team collaboration",
    description:
      "Share secrets with your team without compromising security. Each member has their own keys and encryption.",
    area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
  },
  {
    icon: Zap,
    title: "Lightning fast & reliable",
    description:
      "All cryptographic operations happen locally for instant response. No waiting for server-side encryption or decryption.",
    area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
  },
];

export function WhyCryptlySection() {
  return (
    <section className="relative md:py-24 py-8 px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: [0, 1, 0, 1] }}
        >
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            We take sh*t seriously
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            True zero-knowledge architecture means your secrets are yours alone
          </p>
        </motion.div>

        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <GridItem
                key={index}
                area={feature.area}
                icon={<IconComponent className="h-5 w-5 text-green-600" />}
                title={feature.title}
                description={feature.description}
              />
            );
          })}
        </ul>
      </div>
    </section>
  );
}
