import { motion } from "motion/react";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import posthog from "posthog-js";

interface Review {
  name: string;
  username: string;
  body: string;
  img: string;
}

const reviews: Review[] = [
  {
    name: "Alex Chen",
    username: "@alexchen",
    body: "Finally, a seamless secrets management. The GitHub integration alone saved me hours every week.",
    img: "/avatars/alex-chen.svg",
  },
  {
    name: "Michael Foster",
    username: "@mfoster",
    body: "Zero-knowledge encryption that actually works. Our security team approved it in under 10 minutes.",
    img: "/avatars/sarah-williams.svg",
  },
  {
    name: "Marcus Rodriguez",
    username: "@mrodriguez",
    body: "No more copy-pasting API keys in Slack. This is how secrets management should work.",
    img: "/avatars/marcus-rodriguez.svg",
  },
  {
    name: "Daniel Martinez",
    username: "@dmartinez",
    body: "The fact that it's open source AND free is insane. We migrated our entire team in an afternoon.",
    img: "/avatars/emily-park.svg",
  },
  {
    name: "David Kim",
    username: "@davidkim",
    body: "Pushed secrets to 15 repos with one click. My deployment workflow just got 10x faster.",
    img: "/avatars/david-kim.svg",
  },
  {
    name: "Tom Anderson",
    username: "@tomanderson",
    body: "Switched from LastPass + manual GitHub updates. Never looking back.",
    img: "/avatars/tom-anderson.svg",
  },
  {
    name: "James Wilson",
    username: "@jwilson",
    body: "Best DevOps tool I've discovered this year. Simple, secure, and it just works.",
    img: "/avatars/james-wilson.svg",
  },
  {
    name: "Sam Harris",
    username: "@samharris",
    body: "No more 'can you send me that key again?' ping pong in Slack. This is a game changer.",
    img: "/avatars/nina-gupta.svg",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

export function ReviewsSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: [0, 1, 0, 1] }}
        >
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            But don't just take our word for it
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            See what teams are saying about their experience
          </p>
        </motion.div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="[--duration:40s]">
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:40s]">
            {secondRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black"></div>
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="text-sm text-neutral-500">
            We had to make up some of these reviews.{" "}
            <button
              onClick={() => {
                posthog.displaySurvey("0199fe37-0597-0000-b1de-1eb7cc4ef335");
              }}
              className="text-neutral-400 hover:text-neutral-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Share your experience
            </button>{" "}
            and help us make them real.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

interface ReviewCardProps {
  img: string;
  name: string;
  username: string;
  body: string;
}

const ReviewCard = ({ img, name, username, body }: ReviewCardProps) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/50",
        "backdrop-blur transition-colors"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img
          className="rounded-full border border-neutral-700"
          width="32"
          height="32"
          alt=""
          src={img}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-neutral-400">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm text-neutral-300">{body}</blockquote>
    </figure>
  );
};
