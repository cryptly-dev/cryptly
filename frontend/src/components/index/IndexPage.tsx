import Beams from "@/components/Beams";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { authLogic } from "@/lib/logics/authLogic";
import { useNavigate } from "@tanstack/react-router";
import { useValues } from "kea";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { ComplianceSection } from "./ComplianceSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { WhyCryptlySection } from "./WhyCryptlySection";
import { IntegrationsSection } from "./IntegrationsSection";
import { ReviewsSection } from "./ReviewsSection";

export function IndexPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useValues(authLogic);

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate({ to: "/app/project" });
    } else {
      navigate({ to: "/app/login" });
    }
  };

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

        <div className="absolute bottom-0 h-64 bg-gradient-to-t from-black to-transparent w-full z-0 pointer-events-none"></div>
        <div className="absolute top-0 h-64 bg-gradient-to-b from-black to-transparent w-full z-0 pointer-events-none"></div>

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
            Share your environment secrets
            <br />
            without possibility of 3rd parties getting involved (even us)
          </motion.p>

          <motion.div
            className="mt-10 flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0, 0.55, 0.45, 1], delay: 0.4 }}
          >
            <button
              onClick={handleDashboardClick}
              className="cursor-pointer group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white text-black px-8 py-3 font-semibold shadow-2xl transition-all hover:scale-105 hover:shadow-white/25"
            >
              <span>Dashboard</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

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
            <span>E2E Encrypted</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Free Forever</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Open Source</span>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 text-neutral-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
        >
          <p
            className="text-sm cursor-pointer hover:text-neutral-400 transition-colors"
            onClick={() => {
              const featuresSection = document.querySelector(
                "section:nth-of-type(2)"
              );
              featuresSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Scroll to explore
          </p>
        </motion.div>
      </section>

      <ComplianceSection />

      <IntegrationsSection />

      <HowItWorksSection />

      <WhyCryptlySection />

      <ReviewsSection />

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
              <span className="">Stop wrestling with .env files</span>
            </h2>
            <p className="mt-6 text-lg text-neutral-400">
              Join developers who ship faster with proper secrets management. No
              more Slack DMs, no more manual updates.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={handleDashboardClick}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white text-black px-8 py-3 font-semibold shadow-2xl transition-all hover:scale-105 hover:shadow-white/25"
              >
                <span>Get started - it's free</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
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
            © 2025 Cryptly. Ship faster with proper secrets management.
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
