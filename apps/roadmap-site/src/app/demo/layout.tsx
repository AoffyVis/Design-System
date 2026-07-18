import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Demo — Company Design System",
  description:
    "Explore the Company Design System interactively: playground, token explorer, component showcase, typography, and accessibility demos.",
};

export default function DemoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Real, currently-built @company/tokens + @company/css-core output —
          see src/app/demo/design-system.css/route.ts. Only loaded on this
          route; core.css's utility classes are @scope'd to [data-ds-live]
          elements so they can't collide with the rest of the site's
          Tailwind classes. Not a static CSS import on purpose: the target
          is a Route Handler that reads dist output at request time, which
          Next's built-in CSS bundling can't express. */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/demo/design-system.css" />
      {children}
    </>
  );
}
