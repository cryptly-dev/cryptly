import Beams from "@/components/Beams";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Fingerprint,
  KeyRound,
  Lock,
  Server,
  Shield,
  Terminal,
  Users,
  CloudUpload,
  Plug,
  Sparkles,
  Zap,
} from "lucide-react";
import { IconPlugConnected } from "@tabler/icons-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function IndexPage() {
  return (
    <div className="min-h-screen bg-black tracking-wide">
      {/* Hero Section with Beams */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Beams
            beamWidth={2}
            beamHeight={30}
            beamNumber={20}
            lightColor="#ffffff"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={30}
          />
        </div>

        <motion.div
          className="relative z-10 mt-20 w-full max-w-6xl mx-auto px-6"
          initial={{ opacity: 0, y: 100, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 2, ease: [0, 1, 0, 1] }}
        >
          <h1 className="text-center text-5xl font-bold text-neutral-100 md:text-7xl lg:text-8xl">
            <span className="">Cryptly</span>
          </h1>

          <motion.p
            className="mx-auto mt-6  text-center text-xl text-neutral-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0, 0.55, 0.45, 1], delay: 0.2 }}
          >
            Zero-knowledge secrets management
            <br />
            where even we can't access your data
          </motion.p>

          <motion.div
            className="mt-10 flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0, 0.55, 0.45, 1], delay: 0.4 }}
          >
            <Link
              to="/app/project"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white text-black px-8 py-3 font-semibold shadow-2xl transition-all hover:scale-105 hover:shadow-white/25"
            >
              <span>Dashboard</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="https://github.com/cryptly-dev/cryptly"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/70 px-8 py-3 font-semibold text-white transition-all hover:border-neutral-600 hover:bg-neutral-800/70"
            >
              <GitHubIcon className="h-5 w-5" />
              <span>Source</span>
            </a>
          </motion.div>
        </motion.div>
        <motion.div
          className="mt-8 flex items-center justify-center gap-2 sm:gap-8 text-xs sm:text-sm text-neutral-300 bg-black/20 rounded-full px-4 py-2 w-fit mx-auto backdrop-blur-xl border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Free Forever</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Open Source</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>E2E Encrypted</span>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 text-neutral-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
        >
          <p className="text-sm">Scroll to explore</p>
        </motion.div>
      </section>

      {/* Features Section with GlowingEffect */}
      <section className="relative py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 100, scale: 0.5 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: [0, 1, 0, 1] }}
          >
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              <span className="">Why Cryptly?</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              True zero-knowledge architecture means your secrets are yours
              alone
            </p>
          </motion.div>

          <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
            <GridItem
              area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
              icon={<Lock className="h-5 w-5 text-neutral-400" />}
              title="End-to-end encryption"
              description="All encryption happens in your browser. We never see your actual secrets - it's mathematically impossible for us to decrypt them."
            />

            <GridItem
              area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
              icon={<KeyRound className="h-5 w-5 text-neutral-400" />}
              title="Local key generation"
              description="Your cryptographic keys are generated locally in your browser. Your private key never leaves your device in plaintext."
            />

            <GridItem
              area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
              icon={<Shield className="h-5 w-5 text-neutral-400" />}
              title="Passphrase protected"
              description="Your private key is encrypted with your passphrase using AES-256-GCM. Even if someone accesses your encrypted key, it's useless without your passphrase."
            />

            <GridItem
              area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
              icon={<Users className="h-5 w-5 text-neutral-400" />}
              title="Secure team collaboration"
              description="Share secrets with your team without compromising security. Each member has their own keys and encryption."
            />

            <GridItem
              area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
              icon={<Zap className="h-5 w-5 text-neutral-400" />}
              title="Lightning fast & reliable"
              description="All cryptographic operations happen locally for instant response. No waiting for server-side encryption or decryption."
            />
          </ul>
        </div>
      </section>

      {/* How It Works Summary */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 100, scale: 0.5 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: [0, 1, 0, 1] }}
          >
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              <span className="">How it works</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Military-grade encryption meets developer-friendly experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="relative rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                ease: [0, 0.55, 0.45, 1],
                delay: 0.1,
              }}
            >
              <div className="mb-4 inline-flex rounded-lg bg-neutral-700/20 p-3">
                <Fingerprint className="h-6 w-6 text-neutral-300" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                1. Authenticate
              </h3>
              <p className="text-sm text-neutral-400">
                Log in and your browser generates a unique cryptographic key
                pair. Your private key is immediately encrypted with your
                passphrase.
              </p>
            </motion.div>

            <motion.div
              className="relative rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                ease: [0, 0.55, 0.45, 1],
                delay: 0.2,
              }}
            >
              <div className="mb-4 inline-flex rounded-lg bg-neutral-700/20 p-3">
                <Terminal className="h-6 w-6 text-neutral-300" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                2. Create & edit
              </h3>
              <p className="text-sm text-neutral-400">
                Every secret you add is encrypted in your browser before
                transmission. Each project has its own encryption key for
                additional security.
              </p>
            </motion.div>

            <motion.div
              className="relative rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur"
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                ease: [0, 0.55, 0.45, 1],
                delay: 0.3,
              }}
            >
              <div className="mb-4 inline-flex rounded-lg bg-neutral-700/20 p-3">
                <Server className="h-6 w-6 text-neutral-300" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                3. Store securely
              </h3>
              <p className="text-sm text-neutral-400">
                We only store encrypted data. Even if our servers were
                compromised, your secrets remain safe - we literally cannot
                decrypt them.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <IntegrationsSection />

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              <span className="">Ready to secure your secrets?</span>
            </h2>
            <p className="mt-6 text-lg text-neutral-400">
              Join developers who trust Cryptly for zero-knowledge secrets
              management.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/app/project"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white text-black px-8 py-3 font-semibold shadow-2xl transition-all hover:scale-105 hover:shadow-white/25"
              >
                <span>Start using Cryptly</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-2 sm:gap-8 text-xs sm:text-sm text-neutral-500">
              <div className="flex items-center gap-1 sm:gap-2 ">
                <Check className="h-4 w-4 text-green-600 " />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 ">
                <Check className="h-4 w-4 text-green-600" />
                <span>Open Source</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 ">
                <Check className="h-4 w-4 text-green-600" />
                <span>E2E Encrypted</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-neutral-500">
            © 2025 Cryptly. Zero-knowledge secrets management.
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <a
              href="https://github.com/cryptly-dev/cryptly"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-300 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/cryptly-dev/cryptly"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-300 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2xl border border-neutral-800 p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl bg-neutral-900/50 backdrop-blur p-6 md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-neutral-700 bg-neutral-800/50 p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="font-sans text-xl font-semibold text-white md:text-2xl">
                {title}
              </h3>
              <p className="font-sans text-sm text-neutral-400 md:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

function IntegrationsSection() {
  const [selectedTab, setSelectedTab] = useState<"github" | "more">("github");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedInstallation, setSelectedInstallation] =
    useState("cryptly-dev");
  const [selectedRepository, setSelectedRepository] = useState(
    "cryptly-dev/cryptly"
  );
  const [lastSyncTime, setLastSyncTime] = useState("2 minutes ago");

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime("just now");
    }, 1000);
  };

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
    }, 1000);
  };

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 100, scale: 0.5 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: [0, 1, 0, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/30 px-4 py-2 mb-6 backdrop-blur">
            <IconPlugConnected className="h-4 w-4 text-neutral-300" />
            <span className="text-sm text-neutral-300">Integrations</span>
          </div>
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            <span className="">One click sync</span>
          </h2>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
            Connect your tools and sync your secrets instantly. No manual
            copying, no hassle.
          </p>
        </motion.div>

        <div className="relative">
          {/* Decorative glow effect */}
          <div className="absolute inset-0 -top-32 flex items-center justify-center opacity-30">
            <div className="h-96 w-96 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-3xl" />
          </div>

          <motion.div
            className="relative rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900/90 to-neutral-950/90 p-8 md:p-12 backdrop-blur-xl"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0, 0.55, 0.45, 1] }}
          >
            {/* Pills */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => setSelectedTab("github")}
                className={`inline-flex items-center gap-3 rounded-2xl border px-5 py-3 transition-all cursor-pointer ${
                  selectedTab === "github"
                    ? "border-neutral-600 bg-neutral-800/70"
                    : "border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50"
                }`}
              >
                <GitHubIcon className="h-6 w-6" />
                <span className="text-lg font-semibold text-white">GitHub</span>
                <div className="ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400 border border-green-500/20">
                  Available now
                </div>
              </button>

              <button
                onClick={() => setSelectedTab("more")}
                className={`inline-flex items-center gap-3 rounded-2xl border px-5 py-3 transition-all cursor-pointer ${
                  selectedTab === "more"
                    ? "border-neutral-600 bg-neutral-800/70"
                    : "border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50"
                }`}
              >
                <Sparkles className="h-6 w-6 text-neutral-300" />
                <span className="text-lg font-semibold text-white">More</span>
                <div className="ml-2 rounded-full bg-neutral-500/10 px-2 py-0.5 text-xs font-medium text-neutral-400 border border-neutral-500/20">
                  Available soon
                </div>
              </button>
            </div>

            {selectedTab === "github" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Content */}
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold text-white md:text-4xl">
                    Sync secrets to your repos
                  </h3>

                  <p className="text-neutral-400 text-lg leading-relaxed">
                    Connect your GitHub repository and push encrypted secrets
                    directly to GitHub Actions with a single click. No more
                    manual updates, no more outdated secrets.
                  </p>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-lg bg-neutral-800/50 p-2">
                        <Plug className="h-4 w-4 text-neutral-300" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">
                          Instant connection
                        </h4>
                        <p className="text-sm text-neutral-400">
                          OAuth integration makes connecting your repos
                          effortless
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-lg bg-neutral-800/50 p-2">
                        <CloudUpload className="h-4 w-4 text-neutral-300" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">
                          One click sync
                        </h4>
                        <p className="text-sm text-neutral-400">
                          Update all repository secrets with a single button
                          press
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-lg bg-neutral-800/50 p-2">
                        <Lock className="h-4 w-4 text-neutral-300" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">
                          Always encrypted
                        </h4>
                        <p className="text-sm text-neutral-400">
                          Secrets are decrypted locally before syncing - your
                          keys never leave your browser
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Mock UI from actual app */}
                <div className="relative">
                  <div className="relative rounded-2xl border border-neutral-700 bg-neutral-900/80 p-6 backdrop-blur">
                    <div className="space-y-6">
                      {/* Existing Integration */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Plug className="h-4 w-4 text-neutral-500" />
                          <h3 className="text-sm font-medium text-neutral-300">
                            Integrations
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg">
                          <GitHubIcon className="h-5 w-5 text-neutral-300" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              cryptly-dev/cryptly
                            </div>
                            <div className="text-xs text-neutral-500">
                              Repository ID: 123456789
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-neutral-700" />

                      {/* New Integration Form */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Server className="h-4 w-4 text-neutral-500" />
                          <h3 className="text-sm font-medium text-neutral-300">
                            New integration
                          </h3>
                        </div>

                        {/* Provider and Installation selectors */}
                        <div className="flex gap-2 mb-3">
                          <Select value="github" disabled>
                            <SelectTrigger className="w-[140px] bg-neutral-800/50 border-neutral-700">
                              <SelectValue>
                                <div className="flex items-center gap-2">
                                  <GitHubIcon className="h-4 w-4" />
                                  <span>GitHub</span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                          </Select>

                          <Select
                            value={selectedInstallation}
                            onValueChange={setSelectedInstallation}
                          >
                            <SelectTrigger className="flex-1 bg-neutral-800/50 border-neutral-700">
                              <SelectValue placeholder="Choose installation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cryptly-dev">
                                <div className="flex items-center gap-2">
                                  <img
                                    src="https://avatars.githubusercontent.com/u/232047591?v=4"
                                    alt="cryptly-dev"
                                    className="h-5 w-5 rounded-full"
                                  />
                                  <span>cryptly-dev</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="other-org">
                                <div className="flex items-center gap-2">
                                  <img
                                    src="https://avatars.githubusercontent.com/u/232047591?v=4"
                                    alt="other-org"
                                    className="h-5 w-5 rounded-full"
                                  />
                                  <span>other-org</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Repository selector and Connect button */}
                        <div className="flex gap-2 mb-3">
                          <Select
                            value={selectedRepository}
                            onValueChange={setSelectedRepository}
                          >
                            <SelectTrigger className="flex-1 bg-neutral-800/50 border-neutral-700">
                              <SelectValue placeholder="Choose repository" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cryptly-dev/cryptly">
                                <div className="flex items-center gap-2">
                                  <img
                                    src="https://avatars.githubusercontent.com/u/232047591?v=4"
                                    alt="cryptly"
                                    className="h-5 w-5 rounded-full"
                                  />
                                  <span>cryptly-dev/cryptly</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="cryptly-dev/docs">
                                <div className="flex items-center gap-2">
                                  <img
                                    src="https://avatars.githubusercontent.com/u/232047591?v=4"
                                    alt="docs"
                                    className="h-5 w-5 rounded-full"
                                  />
                                  <span>cryptly-dev/docs</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="cryptly-dev/api">
                                <div className="flex items-center gap-2">
                                  <img
                                    src="https://avatars.githubusercontent.com/u/232047591?v=4"
                                    alt="api"
                                    className="h-5 w-5 rounded-full"
                                  />
                                  <span>cryptly-dev/api</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            isLoading={isConnecting}
                            className="cursor-pointer"
                          >
                            Connect
                          </Button>
                        </div>
                      </div>

                      <div className="h-px bg-neutral-700" />

                      {/* Sync Button */}
                      <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="w-full rounded-lg bg-white text-black font-semibold py-3 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSyncing ? (
                          <>
                            <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            <span>Syncing...</span>
                          </>
                        ) : (
                          <>
                            <CloudUpload className="h-4 w-4" />
                            <span>Push to GitHub</span>
                          </>
                        )}
                      </button>

                      <p className="text-xs text-center text-neutral-500">
                        Last synced: {lastSyncTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-6">
                <div className="inline-flex rounded-full bg-neutral-800/50 p-4">
                  <Sparkles className="h-12 w-12 text-neutral-300" />
                </div>
                <div className="space-y-3 max-w-xl mx-auto">
                  <h3 className="text-2xl font-bold text-white">
                    More integrations coming soon
                  </h3>
                  <p className="text-neutral-400 text-lg">
                    We're happy to add integrations for other platforms! Let us
                    know what you need and we'll prioritize it.
                  </p>
                </div>
                <a
                  href="https://github.com/cryptly-dev/cryptly/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-semibold hover:scale-105 transition-transform"
                >
                  <span>Request integration</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
