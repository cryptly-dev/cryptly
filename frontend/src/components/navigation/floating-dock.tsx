"use client";
import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse, IconLoader2 } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

import { useEffect, useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
    badge?: number;
    isActive?: boolean;
  }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

  // Reset loading state when pathname changes (page finishes loading)
  useEffect(() => {
    setLoadingItem(null);
  }, []);

  const handleClick = () => {
    // Don't show loading state if clicking on current page
    // if (href === pathname) return;
    // e.preventDefault();
    // setLoadingItem(title);
    // router.push(href);
  };

  return (
    <>
      <FloatingDockDesktop
        items={items}
        className={desktopClassName}
        loadingItem={loadingItem}
        onItemClick={handleClick}
      />
      <FloatingDockMobile
        items={items}
        className={mobileClassName}
        loadingItem={loadingItem}
        onItemClick={handleClick}
      />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
  loadingItem,
  onItemClick,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
    badge?: number;
    isActive?: boolean;
  }[];
  className?: string;
  loadingItem: string | null;
  onItemClick: () => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <Link
                  to={item.href}
                  key={item.title}
                  onClick={() => onItemClick()}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900 active:scale-90 transition-transform"
                >
                  <div className="h-4 w-4">
                    {loadingItem === item.title ? (
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      item.icon
                    )}
                  </div>
                  {/* {item.isActive && (
                    <div className="absolute bottom-0 h-0.5 w-0.5 rounded-full bg-white opacity-80" />
                  )} */}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800 active:scale-90 transition-transform"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
  loadingItem,
  onItemClick,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
    badge?: number;
    isActive?: boolean;
  }[];
  className?: string;
  loadingItem: string | null;
  onItemClick: () => void;
}) => {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 md:flex dark:bg-neutral-900",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer
          mouseX={mouseX}
          key={item.title}
          {...item}
          isLoading={loadingItem === item.title}
          onItemClick={onItemClick}
          badge={item.badge}
          isActive={item.isActive}
        />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  isLoading,
  onItemClick,
  badge,
  isActive,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  isLoading: boolean;
  onItemClick: () => void;
  badge?: number;
  isActive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  );
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <Link to={href} onClick={() => onItemClick()}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800 active:scale-90 transition-transform"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {isLoading ? <IconLoader2 className="animate-spin" /> : icon}
        </motion.div>
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-1.5 h-0.5 w-3 rounded-full bg-white"
          />
        )}
        {badge && badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-semibold text-white">
            {badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
}
