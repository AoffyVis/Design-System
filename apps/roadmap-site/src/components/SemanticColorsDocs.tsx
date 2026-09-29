"use client";

import { useEffect, useState, type ReactElement } from "react";

import { SEMANTIC_COLOR_GROUPS } from "@/content/semantic-colors";

interface SemanticColorsDocsProps {
  onCopy: (text: string) => void;
  /** Active theme; changing it re-reads the resolved token values. */
  theme: string;
}

/**
 * SemanticUI color tokens (designer's Figma export → packages/tokens).
 * Swatches and the shown value come from the live custom properties, so
 * they always match the currently active theme and never duplicate a hex.
 */
export default function SemanticColorsDocs({
  onCopy,
  theme,
}: SemanticColorsDocsProps): ReactElement {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // The theme attribute is applied synchronously by the parent before this
    // effect runs; wait one frame so the stylesheet cascade has settled.
    const frame = requestAnimationFrame(() => {
      const style = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const { tokens } of SEMANTIC_COLOR_GROUPS) {
        for (const variable of tokens) {
          next[variable] = style.getPropertyValue(variable).trim();
        }
      }
      setValues(next);
    });
    return () => cancelAnimationFrame(frame);
  }, [theme]);

  return (
    <div>
      {SEMANTIC_COLOR_GROUPS.map(({ group, tokens }) => (
        <div key={group} className="mt-6">
          <h3 className="mb-2 text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-300">
            {group}
          </h3>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="w-16 px-3 py-2 font-medium">Swatch</th>
                  <th scope="col" className="px-3 py-2 font-medium">CSS variable</th>
                  <th scope="col" className="px-3 py-2 font-medium">Current value</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((variable) => (
                  <tr
                    key={variable}
                    className="border-t border-zinc-200 dark:border-zinc-700"
                  >
                    <td className="px-3 py-2">
                      <div
                        className="h-7 w-10 rounded border border-zinc-300 dark:border-zinc-600"
                        style={{ backgroundColor: `var(${variable})` }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onCopy(`var(${variable})`)}
                        className="font-mono text-zinc-800 hover:underline dark:text-zinc-200"
                        aria-label={`Copy var(${variable})`}
                      >
                        {variable}
                      </button>
                    </td>
                    <td className="px-3 py-2 font-mono text-zinc-500 dark:text-zinc-400">
                      {values[variable] ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
