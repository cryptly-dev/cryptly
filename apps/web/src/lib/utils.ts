import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createRandomString } from "$lib/crypto/crypto.utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function defaultLoader() {
  await new Promise((resolve) => setTimeout(resolve, 200));
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes === 0) {
        return diffInSeconds <= 10 ? "just now" : "less than a minute ago";
      }
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    }
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else if (diffInDays === 1) {
    return "yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years === 1 ? "" : "s"} ago`;
  }
}

export function getCompactRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);

  if (diffInSeconds < 60) return "now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo`;
  return `${Math.floor(diffInDays / 365)}y`;
}

export function withTimeout<T>(
  p: Promise<T>,
  ms: number,
): Promise<T | undefined> {
  return Promise.race([
    p,
    new Promise<undefined>((resolve) =>
      setTimeout(() => resolve(undefined), ms),
    ),
  ]);
}

export function getDeviceId(): string {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

export function getDeviceName(): string {
  const userAgent = navigator.userAgent;
  let deviceName = "Unknown Device";

  if (userAgent.includes("Windows")) {
    deviceName = "Windows";
  } else if (userAgent.includes("Mac")) {
    deviceName = "Mac";
  } else if (userAgent.includes("Linux")) {
    deviceName = "Linux";
  } else if (userAgent.includes("Android")) {
    deviceName = "Android";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    deviceName = "iOS";
  }

  if (userAgent.includes("Chrome")) {
    deviceName += " - Chrome";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    deviceName += " - Safari";
  } else if (userAgent.includes("Firefox")) {
    deviceName += " - Firefox";
  } else if (userAgent.includes("Edge")) {
    deviceName += " - Edge";
  }

  return deviceName;
}

function generateDeviceId(): string {
  return `device-${Date.now()}-${createRandomString(13)}`;
}
