import type { HomepageContent } from "@/lib/types";

/**
 * Homepage's own content module (Requirement 2). Mirrors the Overview, Vision,
 * and Supported Platforms sections of the repository root README.md.
 *
 * Requirement 7's anti-duplication rule applies only to Roadmap Phase content
 * parsed from docs/ROADMAP.md, not to this Homepage content module.
 */
export const homepageContent: HomepageContent = {
  platformName: "Company Design System",
  overview:
    "Company Design System is an enterprise-grade platform that enables teams to build consistent, maintainable, and scalable user interfaces across multiple frontend technologies. Rather than being a CSS framework alone, the project provides a complete design infrastructure built around semantic Design Tokens. Generated assets can be consumed by any supported platform while maintaining a single source of truth.",
  vision:
    "Create a unified design language that can be shared across every application within the organization. The platform aims to eliminate duplicated styling logic, standardize design implementation, improve developer experience, enable multi-brand support, and reduce long-term maintenance costs.",
  supportedPlatforms: [
    "HTML",
    "React",
    "Next.js",
    "Vue",
    "Angular",
    "Svelte",
    "Blazor",
    "ASP.NET MVC",
    "Razor",
    "Laravel",
  ],
};
