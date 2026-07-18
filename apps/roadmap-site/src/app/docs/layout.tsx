import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — Company Design System",
  description:
    "Component documentation with live examples, CSS override patterns, and usage guides.",
};

export default function DocsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Real, currently-built @company/tokens + @company/css-core output —
          see src/app/demo/design-system.css/route.ts. Only loaded on /demo
          and /docs routes; core.css's utility/component classes are scoped
          to [data-ds-live] elements so they can't collide with the rest of
          the site's Tailwind classes. */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/demo/design-system.css" />
      {children}
    </>
  );
}
