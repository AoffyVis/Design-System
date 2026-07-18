"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactElement, type RefObject } from "react";

interface CodeBlockProps {
  children: string;
}

type TabId = "profile" | "security";

interface TabDefinition {
  id: TabId;
  label: string;
  panelId: string;
}

const TABS: TabDefinition[] = [
  { id: "profile", label: "Profile", panelId: "demo-profile-panel" },
  { id: "security", label: "Security", panelId: "demo-security-panel" },
];

type TableSortKey = "name" | "email" | "status";
type SortDirection = "asc" | "desc";

interface TableRow {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Review" | "Blocked";
  statusClass: "badge-success" | "badge-warning" | "badge-error";
}

const TABLE_ROWS: TableRow[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@company.example", status: "Active", statusClass: "badge-success" },
  { id: 2, name: "Grace Hopper", email: "grace@company.example", status: "Review", statusClass: "badge-warning" },
  { id: 3, name: "Alan Turing", email: "alan@company.example", status: "Blocked", statusClass: "badge-error" },
  { id: 4, name: "Katherine Johnson", email: "katherine@company.example", status: "Active", statusClass: "badge-success" },
  { id: 5, name: "Edsger Dijkstra", email: "edsger@company.example", status: "Review", statusClass: "badge-warning" },
];

const TABLE_PAGE_SIZE = 2;

export default function AdvancedComponentsDemo(): ReactElement {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalTriggerRef = useRef<HTMLButtonElement>(null);

  const handleTabChange = useCallback((tabId: TabId): void => {
    setActiveTab(tabId);
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
    <section id="advanced-components" className="mb-16">
      <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
        Advanced Components <LiveBadge />
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
        Live examples for the Table, Modal, Navigation, and Tabs component
        classes. The CSS supplies presentation; this page owns the small
        interaction state for the tabs and modal.
      </p>

      <div className="mt-8 space-y-10">
        <TableDemo />
        <NavigationDemo />

        <div className="grid gap-8 lg:grid-cols-2">
          <TabsDemo activeTab={activeTab} onTabChange={handleTabChange} />
          <ModalDemo
            isOpen={isModalOpen}
            onOpen={openModal}
            onClose={closeModal}
            triggerRef={modalTriggerRef}
          />
        </div>
      </div>

      {isModalOpen ? <ModalOverlay onClose={closeModal} /> : null}
    </section>
  );
}

function TableDemo(): ReactElement {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<TableSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRows = useMemo((): TableRow[] => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return TABLE_ROWS;

    return TABLE_ROWS.filter((row) =>
      [row.name, row.email, row.status].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [query]);

  const sortedRows = useMemo((): TableRow[] => {
    return [...filteredRows].sort((left, right) => {
      const comparison = left[sortKey].localeCompare(right[sortKey]);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredRows, sortDirection, sortKey]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / TABLE_PAGE_SIZE));
  const visibleRows = useMemo(
    (): TableRow[] =>
      sortedRows.slice(
        (currentPage - 1) * TABLE_PAGE_SIZE,
        currentPage * TABLE_PAGE_SIZE
      ),
    [currentPage, sortedRows]
  );

  const handleQueryChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((nextKey: TableSortKey): void => {
    if (sortKey === nextKey) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(nextKey);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  }, [sortKey]);

  const handleSortKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTableCellElement>, nextKey: TableSortKey): void => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      handleSort(nextKey);
    },
    [handleSort],
  );

  const handlePageChange = useCallback((nextPage: number): void => {
    setCurrentPage(Math.max(1, Math.min(nextPage, pageCount)));
  }, [pageCount]);

  const getSortClassName = (key: TableSortKey): string => {
    if (sortKey !== key) return "th-sortable";
    return `th-sortable th-sort-${sortDirection}`;
  };

  const getAriaSort = (key: TableSortKey): "ascending" | "descending" | "none" => {
    if (sortKey !== key) return "none";
    return sortDirection === "asc" ? "ascending" : "descending";
  };

  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Table with working filter, sorting, and pagination
      </h3>
      <div data-ds-live className="table-filter">
        <label htmlFor="component-table-filter">Filter users</label>
        <input
          data-ds-live
          id="component-table-filter"
          className="table-filter-input"
          type="search"
          placeholder="Search name, email, or status..."
          value={query}
          onChange={handleQueryChange}
          aria-label="Filter users"
        />
      </div>
      <div data-ds-live className="table-responsive">
        <table data-ds-live className="table table-striped table-hover">
          <caption className="sr-only">Interactive team members table</caption>
          <thead>
            <tr>
              {([
                ["name", "Name"],
                ["email", "Email"],
                ["status", "Status"],
              ] as const).map(([key, label]) => (
                <th
                  data-ds-live
                  key={key}
                  className={getSortClassName(key)}
                  scope="col"
                  aria-sort={getAriaSort(key)}
                  tabIndex={0}
                  onClick={() => handleSort(key)}
                  onKeyDown={(event) => handleSortKeyDown(event, key)}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? visibleRows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>
                  <span data-ds-live className={`badge ${row.statusClass}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3}>No matching users.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <nav data-ds-live className="table-pagination" aria-label="Table pages">
        <button
          data-ds-live
          className="page-btn"
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
          <button
            data-ds-live
            key={page}
            className={`page-btn ${page === currentPage ? "page-btn-active" : ""}`}
            type="button"
            onClick={() => handlePageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
        <button
          data-ds-live
          className="page-btn"
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          Next
        </button>
      </nav>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400" aria-live="polite">
        Showing {visibleRows.length} of {sortedRows.length} matching users · page {currentPage} of {pageCount}
      </p>
      <CodeBlock>
        {`<input value={query} onChange={handleQueryChange} />\n<th class="th-sortable th-sort-asc" aria-sort="ascending">Name</th>\n<button class="page-btn page-btn-active" aria-current="page">1</button>`}
      </CodeBlock>
    </div>
  );
}

function NavigationDemo(): ReactElement {
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
    <div>
      <h3 className="mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Navigation with responsive hamburger
      </h3>
      <nav
        data-ds-live
        className="nav nav-horizontal flex-wrap"
        aria-label="Demo navigation"
      >
        <a data-ds-live className="nav-brand" href="#advanced-components">
          Acme
        </a>
        <button
          data-ds-live
          type="button"
          className="ml-auto inline-flex items-center rounded-md border border-zinc-300
            px-3 py-2 text-sm font-semibold text-zinc-700 md:hidden dark:border-zinc-600
            dark:text-zinc-200"
          aria-expanded={isMenuOpen}
          aria-controls="demo-navigation-menu"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={toggleMenu}
        >
          {isMenuOpen ? "×" : "☰"}
        </button>
        <div
          id="demo-navigation-menu"
          data-ds-live
          className={`${isMenuOpen ? "flex" : "hidden"} w-full flex-col gap-1 md:flex md:w-auto md:flex-row md:items-center`}
        >
          <div data-ds-live className="nav-item">
            <a
              data-ds-live
              className="nav-link nav-link-active"
              href="#profile"
              aria-current="page"
              onClick={closeMenu}
            >
              Home
            </a>
          </div>
          <div data-ds-live className="nav-item">
            <a data-ds-live className="nav-link" href="#settings" onClick={closeMenu}>
              Settings
            </a>
          </div>
          <span
            data-ds-live
            className="nav-divider hidden md:block"
            aria-hidden="true"
          />
          <div data-ds-live className="nav-item">
            <a data-ds-live className="nav-link" href="#help" onClick={closeMenu}>
              Help
            </a>
          </div>
        </div>
      </nav>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        On small screens, the menu uses <code>hidden</code>/<code>flex</code>
        state and opens from the accessible button. At <code>md</code> and
        above, the links remain visible in a horizontal row.
      </p>
      <CodeBlock>
        {`<nav class="nav nav-horizontal flex-wrap" aria-label="Primary navigation">
  <a class="nav-brand" href="/">Acme</a>
  <button type="button" aria-expanded="false" aria-controls="primary-menu">
    Menu
  </button>
  <div id="primary-menu" class="hidden w-full flex-col md:flex md:w-auto md:flex-row">
    <a class="nav-link nav-link-active" href="/" aria-current="page">Home</a>
    <a class="nav-link" href="/settings">Settings</a>
  </div>
</nav>`}
      </CodeBlock>
    </div>
  );
}

interface TabsDemoProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

function TabsDemo({ activeTab, onTabChange }: TabsDemoProps): ReactElement {
  return (
    // min-w-0: this is a grid item — without it the code sample's long
    // unbreakable <pre> lines set its min-content width past the page
    // container, making the whole page scroll horizontally on mobile.
    <div className="min-w-0">
      <h3 className="mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Interactive tabs
      </h3>
      <div data-ds-live className="tabs tabs-pills">
        <div
          data-ds-live
          className="tab-list"
          role="tablist"
          aria-label="Account sections"
        >
          {TABS.map((tab) => (
            <button
              data-ds-live
              key={tab.id}
              id={`demo-${tab.id}-tab`}
              className={`tab-item ${activeTab === tab.id ? "tab-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={tab.panelId}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <section
          data-ds-live
          id="demo-profile-panel"
          className={`tab-panel ${activeTab === "profile" ? "tab-panel-active" : ""}`}
          role="tabpanel"
          aria-labelledby="demo-profile-tab"
          hidden={activeTab !== "profile"}
        >
          Profile content is visible through the generated `.tab-panel-active`
          state.
        </section>
        <section
          data-ds-live
          id="demo-security-panel"
          className={`tab-panel ${activeTab === "security" ? "tab-panel-active" : ""}`}
          role="tabpanel"
          aria-labelledby="demo-security-tab"
          hidden={activeTab !== "security"}
        >
          Security content is selected without changing the CSS bundle.
        </section>
      </div>
      <CodeBlock>
        {`<div class="tabs tabs-pills">\n  <button class="tab-item tab-active" role="tab">Profile</button>\n  <section class="tab-panel tab-panel-active" role="tabpanel">...</section>\n</div>`}
      </CodeBlock>
    </div>
  );
}

interface ModalDemoProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

function ModalDemo({ isOpen, onOpen, onClose, triggerRef }: ModalDemoProps): ReactElement {
  return (
    // min-w-0: grid item — same page-overflow reason as TabsDemo above.
    <div className="min-w-0">
      <h3 className="mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        Modal
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        The CSS controls the dialog presentation. The demo controls visibility
        and close behavior.
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
        Open modal
      </button>
      <CodeBlock>
        {`<div class="modal modal-open" role="dialog" aria-modal="true">\n  <section class="modal-content">...</section>\n</div>`}
      </CodeBlock>
      {isOpen ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Modal is open. Use the close button or Escape-like close action below.
        </p>
      ) : null}
      {isOpen ? <ModalDialog onClose={onClose} /> : null}
    </div>
  );
}

interface ModalOverlayProps {
  onClose: () => void;
}

function ModalOverlay({ onClose }: ModalOverlayProps): ReactElement {
  return <div data-ds-live className="modal-overlay" onClick={onClose} aria-hidden="true" />;
}

function ModalDialog({ onClose }: ModalOverlayProps): ReactElement {
  return (
    <div
      data-ds-live
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <section data-ds-live className="modal-content">
        <header data-ds-live className="modal-header">
          <h4 id="demo-modal-title">Confirm deployment</h4>
          <button
            data-ds-live
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>
        <div data-ds-live className="modal-body">
          <p>CSS presentation remains framework-agnostic and token-driven.</p>
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
  );
}

function CodeBlock({ children }: CodeBlockProps): ReactElement {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100 dark:bg-black">
      <code>{children}</code>
    </pre>
  );
}

function LiveBadge(): ReactElement {
  return (
    <span
      className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5
        align-middle text-xs font-semibold text-emerald-700 dark:bg-emerald-950
        dark:text-emerald-300"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      live
    </span>
  );
}
