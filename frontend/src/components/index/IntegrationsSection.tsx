import { motion } from "motion/react";
import { useState } from "react";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPlugConnected } from "@tabler/icons-react";
import {
  ArrowRight,
  CloudUpload,
  Lock,
  Plug,
  Server,
  Sparkles,
} from "lucide-react";

export function IntegrationsSection() {
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
    <section className="relative md:py-24 py-8 px-6 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
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
            className="relative rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900/50 to-neutral-950 p-8 md:p-12 backdrop-blur-xl"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0, 0.55, 0.45, 1] }}
          >
            {/* Pills */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
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
                  Available
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
                  Coming soon
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
                            <SelectTrigger className=" bg-neutral-800/50 border-neutral-700">
                              <SelectValue>
                                <GitHubIcon className="h-4 w-4" />
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
                                  <span>cryptly</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="cryptly-dev/docs">
                                <div className="flex items-center gap-2">
                                  <img
                                    src="https://avatars.githubusercontent.com/u/232047591?v=4"
                                    alt="docs"
                                    className="h-5 w-5 rounded-full"
                                  />
                                  <span>docs</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="cryptly-dev/api">
                                <div className="flex items-center gap-2">
                                  <img
                                    src="https://avatars.githubusercontent.com/u/232047591?v=4"
                                    alt="api"
                                    className="h-5 w-5 rounded-full"
                                  />
                                  <span>api</span>
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
