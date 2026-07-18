interface SupportedPlatformsListProps {
  platforms: string[];
}

/**
 * Renders the Homepage's supported-platforms list (Requirement 2.4) as a
 * `<ul>` of visual chips. Still a plain, semantic list under the hood — the
 * chip styling is presentational only.
 */
export default function SupportedPlatformsList({
  platforms,
}: SupportedPlatformsListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {platforms.map((platform) => (
        <li
          key={platform}
          className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
        >
          {platform}
        </li>
      ))}
    </ul>
  );
}
