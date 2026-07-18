import type { ReactElement } from "react";

interface ResponsivePatternsDocsProps {
  onCopy: (text: string) => void;
}

interface CodeExampleProps {
  children: string;
  onCopy: (text: string) => void;
}

export default function ResponsivePatternsDocs({
  onCopy,
}: ResponsivePatternsDocsProps): ReactElement {
  return (
    <>
      <h3 className="mt-10 mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Responsive compositions
      </h3>
      <p className="max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
        Notification lists and action bars are composed from responsive utility
        classes. They stack and use full-width controls on small screens, then
        use the available horizontal space from <code>md</code> upward.
      </p>
      {/* min-w-0 on the grid items: without it, the code samples' long
          unbreakable <pre> lines set the item's min-content width (~523px),
          forcing the grid track past the page container and making the whole
          page scroll horizontally on mobile. */}
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="min-w-0">
          <h4 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Notification list
          </h4>
          <div data-ds-live className="flex w-full flex-col gap-3 md:flex-row">
            <div
              data-ds-live
              className="w-full rounded-md bg-success p-4 text-success-contrast shadow-sm md:flex-1"
            >
              <strong>Deploy succeeded</strong>
              <p data-ds-live className="mt-1 text-sm opacity-90">
                All packages built successfully.
              </p>
            </div>
            <div
              data-ds-live
              className="w-full rounded-md bg-warning p-4 text-warning-contrast shadow-sm md:flex-1"
            >
              <strong>Review required</strong>
              <p data-ds-live className="mt-1 text-sm opacity-90">
                Two optional checks need attention.
              </p>
            </div>
            <div
              data-ds-live
              className="w-full rounded-md bg-error p-4 text-error-contrast shadow-sm md:flex-1"
            >
              <strong>Build failed</strong>
              <p data-ds-live className="mt-1 text-sm opacity-90">
                Fix the token reference before publishing.
              </p>
            </div>
          </div>
          <CodeExample onCopy={onCopy}>{`<div class="flex w-full flex-col gap-3 md:flex-row">
  <div class="w-full p-4 bg-success text-success-contrast md:flex-1">
    Deploy succeeded
  </div>
  <div class="w-full p-4 bg-warning text-warning-contrast md:flex-1">
    Review required
  </div>
</div>`}</CodeExample>
        </div>

        <div className="min-w-0">
          <h4 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Action bar
          </h4>
          <div
            data-ds-live
            className="flex w-full flex-col gap-3 rounded-xl bg-primary-light p-6 shadow-md md:flex-row md:items-center"
          >
            <button
              data-ds-live
              className="w-full rounded-full bg-primary px-6 py-3 text-primary-contrast shadow-sm md:w-auto"
              type="button"
            >
              Confirm
            </button>
            <button
              data-ds-live
              className="w-full rounded-full bg-secondary px-6 py-3 text-secondary-contrast shadow-sm md:w-auto"
              type="button"
            >
              Save Draft
            </button>
            <button
              data-ds-live
              className="w-full rounded-full bg-error px-6 py-3 text-error-contrast shadow-sm md:w-auto"
              type="button"
            >
              Delete
            </button>
          </div>
          <CodeExample onCopy={onCopy}>{`<div class="flex w-full flex-col gap-3 md:flex-row md:items-center">
  <button class="w-full btn btn-primary md:w-auto">Confirm</button>
  <button class="w-full btn btn-outline md:w-auto">Cancel</button>
</div>`}</CodeExample>
        </div>
      </div>
    </>
  );
}

function CodeExample({ children, onCopy }: CodeExampleProps): ReactElement {
  return (
    <div className="group relative mt-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
      <button
        onClick={() => onCopy(children)}
        className="absolute right-2 top-2 rounded border border-zinc-300 bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-500 opacity-0 transition group-hover:opacity-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
        aria-label="Copy responsive composition example"
        type="button"
      >
        Copy
      </button>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
        <code>{children}</code>
      </pre>
    </div>
  );
}
