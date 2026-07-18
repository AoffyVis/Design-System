"use client";

import { useCallback, useEffect, useRef, useState, type ReactElement, type RefObject } from "react";

import ResponsivePatternsDocs from "./ResponsivePatternsDocs";

interface AdvancedComponentsDocsProps {
  onCopy: (text: string) => void;
}

interface CodeProps {
  children: string;
  onCopy: (text: string) => void;
}

type DocsTabId = "profile" | "security";

export default function AdvancedComponentsDocs({
  onCopy,
}: AdvancedComponentsDocsProps): ReactElement {
  const [activeTab, setActiveTab] = useState<DocsTabId>("profile");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalTriggerRef = useRef<HTMLButtonElement>(null);

  const handleTabChange = useCallback((tab: DocsTabId): void => {
    setActiveTab(tab);
  }, []);

  const openModal = useCallback((): void => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsModalOpen(false);
    requestAnimationFrame(() => modalTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, isModalOpen]);

  return (
    <>
      <ComponentIntro />
      <ResponsivePatternsDocs onCopy={onCopy} />
      <TableDocs onCopy={onCopy} />
      <ModalDocs
        isOpen={isModalOpen}
        onOpen={openModal}
        onClose={closeModal}
        onCopy={onCopy}
        triggerRef={modalTriggerRef}
      />
      <NavigationDocs onCopy={onCopy} />
      <TabsDocs activeTab={activeTab} onTabChange={handleTabChange} onCopy={onCopy} />
    </>
  );
}

function ComponentIntro(): ReactElement {
  return (
    <>
      <p className="mt-1 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
        Pre-composed classes combine design tokens into reusable UI patterns.
        The original Button, Card, Badge, Input, and Alert examples are followed
        by the Table, Modal, Navigation, and Tabs APIs below.
      </p>
    </>
  );
}

interface TableDocsProps {
  onCopy: (text: string) => void;
}

function TableDocs({ onCopy }: TableDocsProps): ReactElement {
  return (
    <>
      <h3 className="mt-10 mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Table
      </h3>
      <p className="max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
        Table CSS provides presentation states for filtering, sorting, responsive
        overflow, and pagination. The application owns data operations and must
        update <code>aria-sort</code>, <code>aria-current</code>, and the related
        state classes.
      </p>
      <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <div data-ds-live className="table-filter">
          <label htmlFor="docs-table-filter">Filter users</label>
          <input
            data-ds-live
            id="docs-table-filter"
            className="table-filter-input"
            type="search"
            placeholder="Search..."
            aria-label="Filter users"
          />
        </div>
        <div data-ds-live className="table-responsive">
          <table data-ds-live className="table table-striped table-hover">
            <caption className="sr-only">Documented table example</caption>
            <thead>
              <tr>
                <th
                  data-ds-live
                  className="th-sortable th-sort-asc"
                  scope="col"
                  aria-sort="ascending"
                >
                  Name
                </th>
                <th data-ds-live className="th-sortable" scope="col">
                  Email
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ada Lovelace</td>
                <td>ada@company.example</td>
                <td>
                  <span data-ds-live className="badge badge-success">
                    Active
                  </span>
                </td>
              </tr>
              <tr>
                <td>Grace Hopper</td>
                <td>grace@company.example</td>
                <td>
                  <span data-ds-live className="badge badge-warning">
                    Review
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <nav data-ds-live className="table-pagination" aria-label="Table pages">
          <button data-ds-live className="page-btn" type="button">
            Previous
          </button>
          <button
            data-ds-live
            className="page-btn page-btn-active"
            type="button"
            aria-current="page"
          >
            1
          </button>
          <button data-ds-live className="page-btn" type="button">
            Next
          </button>
        </nav>
      </div>
      <Code onCopy={onCopy}>{`<div class="table-filter">
  <label for="user-filter">Filter users</label>
  <input id="user-filter" class="table-filter-input" type="search">
</div>

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
      <tr>
        <th class="th-sortable th-sort-asc" aria-sort="ascending">Name</th>
        <th class="th-sortable">Email</th>
        <th>Status</th>
      </tr>
    </thead>
  </table>
</div>

<nav class="table-pagination" aria-label="Table pages">
  <button class="page-btn page-btn-active" aria-current="page">1</button>
</nav>`}</Code>
    </>
  );
}

interface ModalDocsProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCopy: (text: string) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

function ModalDocs({ isOpen, onOpen, onClose, onCopy, triggerRef }: ModalDocsProps): ReactElement {
  return (
    <>
      <h3 className="mt-10 mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Modal
      </h3>
      <p className="max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
        The consumer adds <code>modal-open</code> to show the dialog and owns
        focus trapping, Escape handling, and the accessible state lifecycle.
      </p>
      <button
        data-ds-live
        className="btn btn-primary mt-4"
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        ref={triggerRef}
      >
        Open modal preview
      </button>
      <Code onCopy={onCopy}>{`<div class="modal modal-open" role="dialog" aria-modal="true">
  <div class="modal-overlay" data-modal-close></div>
  <section class="modal-content">
    <header class="modal-header">Confirm action</header>
    <div class="modal-body">Are you sure?</div>
    <footer class="modal-footer">
      <button class="btn btn-outline">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </footer>
  </section>
</div>`}</Code>
      {isOpen ? (
        <>
          <div data-ds-live className="modal-overlay" onClick={onClose} aria-hidden="true" />
          <div
            data-ds-live
            className="modal modal-open"
            role="dialog"
            aria-modal="true"
            aria-labelledby="docs-modal-title"
          >
            <section data-ds-live className="modal-content">
              <header data-ds-live className="modal-header">
                <h4 id="docs-modal-title">Confirm action</h4>
                <button
                  data-ds-live
                  className="modal-close"
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal preview"
                >
                  ×
                </button>
              </header>
              <div data-ds-live className="modal-body">
                This preview uses the generated Modal component styles.
              </div>
              <footer data-ds-live className="modal-footer">
                <button data-ds-live className="btn btn-outline" type="button" onClick={onClose}>
                  Cancel
                </button>
                <button data-ds-live className="btn btn-primary" type="button" onClick={onClose}>
                  Confirm
                </button>
              </footer>
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}

interface NavigationDocsProps {
  onCopy: (text: string) => void;
}

function NavigationDocs({ onCopy }: NavigationDocsProps): ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const toggleMenu = useCallback((): void => {
    setIsMenuOpen((previous) => !previous);
  }, []);

  const closeMenu = useCallback((): void => {
    setIsMenuOpen(false);
  }, []);

  return (
    <>
      <h3 className="mt-10 mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Navigation
      </h3>
      <p className="max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
        Use semantic <code>nav</code> and link elements. The application owns
        routing and synchronizes <code>nav-link-active</code> with the current route.
        This preview also demonstrates the consumer-owned mobile menu state.
      </p>
      <nav
        data-ds-live
        className="nav nav-horizontal mt-4 flex-wrap"
        aria-label="Documentation navigation preview"
      >
        <a data-ds-live className="nav-brand" href="#components">
          Acme
        </a>
        <button
          data-ds-live
          type="button"
          className="ml-auto rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 md:hidden dark:border-zinc-600 dark:text-zinc-200"
          aria-expanded={isMenuOpen}
          aria-controls="docs-navigation-menu"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={toggleMenu}
        >
          {isMenuOpen ? "×" : "☰"}
        </button>
        <div
          id="docs-navigation-menu"
          data-ds-live
          className={`${isMenuOpen ? "flex" : "hidden"} w-full flex-col gap-1 md:flex md:w-auto md:flex-row md:items-center`}
        >
          <div data-ds-live className="nav-item">
            <a
              data-ds-live
              className="nav-link nav-link-active"
              href="#components"
              aria-current="page"
              onClick={closeMenu}
            >
              Home
            </a>
          </div>
          <div data-ds-live className="nav-item">
            <a data-ds-live className="nav-link" href="#overrides" onClick={closeMenu}>
              Settings
            </a>
          </div>
          <span data-ds-live className="nav-divider hidden md:block" aria-hidden="true" />
          <div data-ds-live className="nav-item">
            <a data-ds-live className="nav-link" href="#dark-light" onClick={closeMenu}>
              Help
            </a>
          </div>
        </div>
      </nav>
      <Code onCopy={onCopy}>{`<nav class="nav nav-horizontal flex-wrap" aria-label="Primary navigation">
  <a class="nav-brand" href="/">Acme</a>
  <button type="button" class="md:hidden"
          aria-expanded="false" aria-controls="primary-menu">
    Menu
  </button>
  <div id="primary-menu" class="hidden w-full flex-col md:flex md:w-auto md:flex-row md:items-center">
    <div class="nav-item">
      <a class="nav-link nav-link-active" href="/" aria-current="page">Home</a>
    </div>
    <div class="nav-item"><a class="nav-link" href="/settings">Settings</a></div>
    <span class="nav-divider hidden md:block" aria-hidden="true"></span>
  </div>
</nav>`}</Code>
    </>
  );
}

interface TabsDocsProps {
  activeTab: DocsTabId;
  onTabChange: (tab: DocsTabId) => void;
  onCopy: (text: string) => void;
}

function TabsDocs({ activeTab, onTabChange, onCopy }: TabsDocsProps): ReactElement {
  return (
    <>
      <h3 className="mt-10 mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Tabs
      </h3>
      <p className="max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
        JavaScript or the host framework switches <code>tab-active</code> and
        <code>tab-panel-active</code> while keeping the ARIA relationships synchronized.
      </p>
      <div data-ds-live className="tabs tabs-bordered mt-4">
        <div data-ds-live className="tab-list" role="tablist" aria-label="Documentation tabs">
          <button
            data-ds-live
            id="docs-profile-tab"
            className={`tab-item ${activeTab === "profile" ? "tab-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === "profile"}
            aria-controls="docs-profile-panel"
            onClick={() => onTabChange("profile")}
          >
            Profile
          </button>
          <button
            data-ds-live
            id="docs-security-tab"
            className={`tab-item ${activeTab === "security" ? "tab-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === "security"}
            aria-controls="docs-security-panel"
            onClick={() => onTabChange("security")}
          >
            Security
          </button>
        </div>
        <section
          data-ds-live
          id="docs-profile-panel"
          className={`tab-panel ${activeTab === "profile" ? "tab-panel-active" : ""}`}
          role="tabpanel"
          aria-labelledby="docs-profile-tab"
          hidden={activeTab !== "profile"}
        >
          Profile content uses the active tab presentation state.
        </section>
        <section
          data-ds-live
          id="docs-security-panel"
          className={`tab-panel ${activeTab === "security" ? "tab-panel-active" : ""}`}
          role="tabpanel"
          aria-labelledby="docs-security-tab"
          hidden={activeTab !== "security"}
        >
          Security content is selected without changing the CSS bundle.
        </section>
      </div>
      <Code onCopy={onCopy}>{`<div class="tabs tabs-pills">
  <div class="tab-list" role="tablist">
    <button class="tab-item tab-active" role="tab" aria-selected="true">Profile</button>
    <button class="tab-item" role="tab" aria-selected="false">Security</button>
  </div>
  <section class="tab-panel tab-panel-active" role="tabpanel">Profile content</section>
</div>`}</Code>
    </>
  );
}

function Code({ children, onCopy }: CodeProps): ReactElement {
  return (
    <div className="group relative mt-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
      <button
        onClick={() => onCopy(children)}
        className="absolute right-2 top-2 rounded border border-zinc-300 bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-500 opacity-0 transition group-hover:opacity-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
        aria-label="Copy code example"
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
