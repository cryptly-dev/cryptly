import { createFileRoute, Outlet } from "@tanstack/react-router";

const BlogLayout = () => (
  <div className="min-h-screen bg-black text-neutral-100">
    <Outlet />
  </div>
);

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});
