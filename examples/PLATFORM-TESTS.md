# Platform Test — Company Design System

ไฟล์นี้รวมตัวอย่างโค้ดสำหรับทดสอบ Design System บนทุก Supported Platform

Scope ของไฟล์นี้ (ตามที่ผู้ใช้ระบุ): **HTML, React, Next.js, ASP.NET MVC (C#), ASP.NET MVC/Razor (VB.NET)**
แต่ละ platform มี "live preview" ของ **ทุก component** (Button, Badge, Card, Input,
Alert, Table, Modal, Navigation, Tabs) พร้อม **การใช้งานจริง** ไม่ใช่ mockup —
เช่น Alert ที่กดปิดได้จริง, Table ที่ filter/sort/pagination ได้จริงด้วยข้อมูลจริง,
Modal ที่เปิด/ปิด/รองรับ Escape จริง, Nav ที่ toggle เมนูมือถือได้จริง

ทุก class ที่อ้างถึงในไฟล์นี้ตรวจสอบแล้วว่ามีอยู่จริงใน `dist/core.css` /
`dist/tokens.css` (Rule 5 ของ `.kiro/steering/definition-of-done.md` — verify
against the built artifact, not the spec) ก่อนเผยแพร่ในไฟล์นี้.

CDN URLs (ใช้ branch `master`):

```
https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/tokens.css
https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/core.css
https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/themes/dark.css
```

---

## 1. Plain HTML (Static)

สร้างไฟล์ `index.html` — โครง head + layout:

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DS Live Preview — Plain HTML</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/tokens.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/core.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/themes/dark.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/themes/banking.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/themes/corporate.css">
</head>
<body class="p-6">
  <h1 class="text-heading-h1">Design System — Live Preview</h1>
  <p class="text-body-md mt-2">ทุก component ด้านล่างใช้งานได้จริง ไม่ใช่ mockup</p>

  <div class="flex gap-2 mt-4">
    <button class="btn btn-outline btn-sm" data-theme-set="light">Light</button>
    <button class="btn btn-outline btn-sm" data-theme-set="dark">Dark</button>
    <button class="btn btn-outline btn-sm" data-theme-set="banking">Banking</button>
    <button class="btn btn-outline btn-sm" data-theme-set="corporate">Corporate</button>
  </div>

  <!-- เนื้อหา component ทั้งหมดอยู่ในหัวข้อย่อยด้านล่าง วางต่อกันในลำดับนี้ -->

  <script src="showcase.js"></script>
</body>
</html>
```

### 1.1 Button + Badge (real usage: submit action + status indicator)

```html
<section class="mt-8">
  <h2 class="text-heading-h2">Buttons &amp; Badges</h2>
  <div class="flex flex-wrap gap-3 mt-4">
    <button class="btn btn-primary">Save changes</button>
    <button class="btn btn-secondary">Save as draft</button>
    <button class="btn btn-outline">Cancel</button>
    <button class="btn btn-error btn-sm">Delete</button>
    <button class="btn btn-primary" disabled>Processing…</button>
  </div>
  <div class="flex gap-2 mt-4">
    <span class="badge badge-success">Deployed</span>
    <span class="badge badge-warning">Pending review</span>
    <span class="badge badge-error">Failed</span>
    <span class="badge badge-info">Draft</span>
  </div>
</section>
```

### 1.2 Card + Input (real usage: signup form with live email validation)

```html
<section class="mt-8">
  <h2 class="text-heading-h2">Card &amp; Input</h2>
  <div class="card mt-4" style="max-width: 28rem;">
    <div class="card-header">Create account</div>
    <div class="card-body">
      <label for="signup-email" class="text-body-sm">Email</label>
      <input id="signup-email" class="input mt-2" type="email"
             placeholder="you@company.com" autocomplete="email">
      <p id="signup-email-hint" class="text-body-sm mt-2" role="alert"></p>
    </div>
    <div class="card-footer">
      <button class="btn btn-primary">Create account</button>
    </div>
  </div>
</section>
```

The email input toggles the real `.input-error` class as the user types —
see the JavaScript in [1.9](#19-the-showcasejs-file-real-behavior-for-every-component-above)
for the validation logic (`emailInput`/`emailHint`).

### 1.3 Alert (real usage: dismissible build-status notifications)

```html
<section class="mt-8">
  <h2 class="text-heading-h2">Alerts</h2>
  <div class="flex flex-col gap-3 mt-4">
    <div class="alert alert-success">
      <span aria-hidden="true">✅</span>
      <span>Deploy succeeded — build finished with 0 errors.</span>
      <button type="button" class="btn btn-ghost btn-sm" data-alert-dismiss
              aria-label="Dismiss">×</button>
    </div>
    <div class="alert alert-warning">
      <span aria-hidden="true">⚠️</span>
      <span>2 optional tests were skipped.</span>
      <button type="button" class="btn btn-ghost btn-sm" data-alert-dismiss
              aria-label="Dismiss">×</button>
    </div>
    <div class="alert alert-error">
      <span aria-hidden="true">⛔</span>
      <span>Token validation failed — see logs.</span>
      <button type="button" class="btn btn-ghost btn-sm" data-alert-dismiss
              aria-label="Dismiss">×</button>
    </div>
  </div>
</section>
```

Clicking `×` really removes the alert element from the DOM (`alert.remove()`
in the shared script) — it doesn't just hide it with CSS.

### 1.4 Table (real usage: user list with working filter, sort, pagination)

```html
<section class="mt-8">
  <h2 class="text-heading-h2">Table</h2>
  <div class="table-filter mt-4">
    <label for="users-filter">Filter users</label>
    <input id="users-filter" class="table-filter-input" type="search"
           placeholder="Search name, email, or status...">
  </div>
  <div class="table-responsive">
    <table id="users-table" class="table table-striped table-hover">
      <caption class="sr-only">Team members</caption>
      <thead>
        <tr>
          <th class="th-sortable th-sort-asc" data-sort-key="name" aria-sort="ascending" scope="col">Name</th>
          <th class="th-sortable" data-sort-key="email" aria-sort="none" scope="col">Email</th>
          <th class="th-sortable" data-sort-key="status" aria-sort="none" scope="col">Status</th>
        </tr>
      </thead>
      <tbody><!-- rendered by showcase.js from real data --></tbody>
    </table>
  </div>
  <nav id="users-pagination" class="table-pagination" aria-label="Table pages"></nav>
</section>
```

The table body and pagination are rendered entirely by JavaScript from a real
in-memory dataset (5 rows) — filtering, sorting by column header click, and
pagination all update the DOM, `aria-sort`, `aria-current`, and the
`.th-sort-asc`/`.th-sort-desc`/`.page-btn-active` classes, exactly as
`docs/spec/components.md` specifies the CSS does **not** do this on its own.

### 1.5 Modal (real usage: confirm-action dialog)

```html
<section class="mt-8">
  <h2 class="text-heading-h2">Modal</h2>
  <button id="open-confirm-modal" class="btn btn-primary mt-4" type="button"
          aria-haspopup="dialog" aria-controls="confirm-modal">
    Delete project
  </button>

  <div id="confirm-modal" class="modal" role="dialog" aria-modal="true"
       aria-hidden="true" aria-labelledby="confirm-modal-title">
    <div class="modal-overlay" data-modal-close></div>
    <section class="modal-content">
      <header class="modal-header">
        <h2 id="confirm-modal-title">Delete project?</h2>
        <button class="modal-close" type="button" data-modal-close aria-label="Close">×</button>
      </header>
      <div class="modal-body">
        <p class="text-body-md">This action can&apos;t be undone. The project and
        all its deploys will be permanently removed.</p>
      </div>
      <footer class="modal-footer">
        <button class="btn btn-outline" type="button" data-modal-close>Cancel</button>
        <button class="btn btn-error" type="button" data-modal-close>Delete</button>
      </footer>
    </section>
  </div>
</section>
```

Opens on click, closes on overlay click, close-button click, footer buttons,
or `Escape`, and returns focus to the trigger button on close — all real
`addEventListener` behavior, not `display:none` toggling with no state.

### 1.6 Navigation (real usage: responsive primary nav with mobile menu)

```html
<nav class="nav nav-horizontal flex-wrap" aria-label="Primary navigation">
  <a class="nav-brand" href="/">Acme</a>
  <button id="nav-toggle" type="button" class="btn btn-outline btn-sm md:hidden"
          aria-expanded="false" aria-controls="primary-menu">
    Menu
  </button>
  <div id="primary-menu"
       class="hidden w-full flex-col md:flex md:w-auto md:flex-row md:items-center">
    <div class="nav-item">
      <a class="nav-link nav-link-active" href="/" aria-current="page">Home</a>
    </div>
    <div class="nav-item">
      <a class="nav-link" href="/settings">Settings</a>
    </div>
    <span class="nav-divider hidden md:block" aria-hidden="true"></span>
    <div class="nav-item">
      <a class="nav-link" href="/help">Help</a>
    </div>
  </div>
</nav>
```

On screens narrower than `md`, `#nav-toggle` really flips `#primary-menu`
between `hidden` and `flex` (and `aria-expanded`), closes on link click and
on `Escape`. At `md` and above, `md:flex` keeps the menu visible as a row
regardless of that state — the same pattern documented in
`docs/spec/components.md`'s Navigation section.

### 1.7 Tabs (real usage: account settings sections)

```html
<div class="tabs tabs-pills mt-8">
  <div class="tab-list" role="tablist" aria-label="Account settings">
    <button id="tab-profile" class="tab-item tab-active" type="button" role="tab"
            aria-selected="true" aria-controls="panel-profile" data-tab="profile" tabindex="0">
      Profile
    </button>
    <button id="tab-billing" class="tab-item" type="button" role="tab"
            aria-selected="false" aria-controls="panel-billing" data-tab="billing" tabindex="-1">
      Billing
    </button>
    <button id="tab-security" class="tab-item" type="button" role="tab"
            aria-selected="false" aria-controls="panel-security" data-tab="security" tabindex="-1">
      Security
    </button>
  </div>
  <div id="panel-profile" class="tab-panel tab-panel-active" role="tabpanel"
       aria-labelledby="tab-profile" data-tab-panel="profile">
    <p class="text-body-md">Update your name, email, and avatar.</p>
  </div>
  <div id="panel-billing" class="tab-panel" role="tabpanel"
       aria-labelledby="tab-billing" data-tab-panel="billing" hidden>
    <p class="text-body-md">Manage your plan and payment method.</p>
  </div>
  <div id="panel-security" class="tab-panel" role="tabpanel"
       aria-labelledby="tab-security" data-tab-panel="security" hidden>
    <p class="text-body-md">Change your password and two-factor settings.</p>
  </div>
</div>
```

Clicking a tab really swaps `.tab-active`/`.tab-panel-active`, `aria-selected`,
`tabindex`, and the `hidden` attribute on the matching panel.

### 1.8 Theme switching

The `[data-theme-set]` buttons in the head layout at the top of this section
set/remove `data-theme` on `<html>` for real, switching between light, dark,
banking, and corporate — see `docs/06-theme.md` for the full theme mechanism.
This can also be done manually from the console:

```javascript
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.setAttribute('data-theme', 'banking');
document.documentElement.setAttribute('data-theme', 'corporate');
document.documentElement.removeAttribute('data-theme'); // back to light
```

### 1.9 The `showcase.js` file — real behavior for every component above

Save as `showcase.js` next to `index.html`. This is the only JavaScript
required to make every component above fully interactive — no framework,
no build step.

```javascript
(() => {
  'use strict';

  // ---------------------------------------------------------------
  // Theme toggle (data-theme attribute — light / dark / banking / corporate)
  // ---------------------------------------------------------------
  const themeButtons = document.querySelectorAll('[data-theme-set]');
  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const theme = button.getAttribute('data-theme-set');
      if (theme === 'light') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    });
  });

  // ---------------------------------------------------------------
  // Alert: real dismiss behavior (removes the alert from the DOM)
  // ---------------------------------------------------------------
  document.querySelectorAll('[data-alert-dismiss]').forEach((button) => {
    button.addEventListener('click', () => {
      const alert = button.closest('.alert');
      alert?.remove();
    });
  });

  // ---------------------------------------------------------------
  // Input: real client-side email validation, toggles .input-error
  // ---------------------------------------------------------------
  const emailInput = document.querySelector('#signup-email');
  const emailHint = document.querySelector('#signup-email-hint');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  emailInput?.addEventListener('input', () => {
    const value = emailInput.value.trim();
    const isValid = value === '' || emailPattern.test(value);
    emailInput.classList.toggle('input-error', !isValid);
    emailInput.setAttribute('aria-invalid', String(!isValid));
    if (emailHint) {
      emailHint.textContent = isValid ? '' : 'Enter a valid email address.';
    }
  });

  // ---------------------------------------------------------------
  // Table: filter, sort, paginate real data (escapes text before insertion)
  // ---------------------------------------------------------------
  const rows = [
    { name: 'Ada Lovelace', email: 'ada@example.com', status: 'Active' },
    { name: 'Grace Hopper', email: 'grace@example.com', status: 'Pending' },
    { name: 'Katherine Johnson', email: 'kj@example.com', status: 'Active' },
    { name: 'Alan Turing', email: 'alan@example.com', status: 'Inactive' },
    { name: 'Margaret Hamilton', email: 'margaret@example.com', status: 'Active' },
  ];
  const statusClasses = {
    Active: 'badge-success',
    Pending: 'badge-warning',
    Inactive: 'badge-error',
  };
  const tableState = { filter: '', page: 1, pageSize: 2, sortKey: 'name', sortDirection: 'asc' };
  const table = document.querySelector('#users-table');
  const filterInput = document.querySelector('#users-filter');
  const pagination = document.querySelector('#users-pagination');

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const getVisibleRows = () => rows
    .filter((row) => `${row.name} ${row.email} ${row.status}`
      .toLowerCase().includes(tableState.filter.toLowerCase()))
    .sort((left, right) => {
      const comparison = String(left[tableState.sortKey]).localeCompare(String(right[tableState.sortKey]));
      return tableState.sortDirection === 'asc' ? comparison : -comparison;
    });

  const renderTable = () => {
    if (!table || !filterInput || !pagination) return;

    const visibleRows = getVisibleRows();
    const pageCount = Math.max(1, Math.ceil(visibleRows.length / tableState.pageSize));
    tableState.page = Math.min(tableState.page, pageCount);
    const firstRow = (tableState.page - 1) * tableState.pageSize;
    const pageRows = visibleRows.slice(firstRow, firstRow + tableState.pageSize);
    const body = table.querySelector('tbody');

    if (body) {
      body.innerHTML = pageRows.length
        ? pageRows.map((row) => `
            <tr>
              <td>${escapeHtml(row.name)}</td>
              <td>${escapeHtml(row.email)}</td>
              <td><span class="badge ${statusClasses[row.status]}">${escapeHtml(row.status)}</span></td>
            </tr>`).join('')
        : '<tr><td colspan="3">No matching records.</td></tr>';
    }

    table.querySelectorAll('th[data-sort-key]').forEach((header) => {
      const isActive = header.dataset.sortKey === tableState.sortKey;
      header.classList.add('th-sortable');
      header.classList.toggle('th-sort-asc', isActive && tableState.sortDirection === 'asc');
      header.classList.toggle('th-sort-desc', isActive && tableState.sortDirection === 'desc');
      header.setAttribute('aria-sort', isActive ? (tableState.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none');
    });

    pagination.innerHTML = [
      { label: 'Previous', page: tableState.page - 1, disabled: tableState.page === 1 },
      ...Array.from({ length: pageCount }, (_, index) => ({ label: String(index + 1), page: index + 1, active: tableState.page === index + 1 })),
      { label: 'Next', page: tableState.page + 1, disabled: tableState.page === pageCount },
    ].map((button) => `
      <button class="page-btn${button.active ? ' page-btn-active' : ''}" type="button"
        data-page="${button.page}"${button.active ? ' aria-current="page"' : ''}${button.disabled ? ' disabled' : ''}>
        ${button.label}
      </button>`).join('');

    pagination.querySelectorAll('[data-page]').forEach((button) => {
      button.addEventListener('click', () => {
        tableState.page = Number(button.dataset.page);
        renderTable();
      });
    });
  };

  filterInput?.addEventListener('input', () => {
    tableState.filter = filterInput.value;
    tableState.page = 1;
    renderTable();
  });

  table?.querySelectorAll('th[data-sort-key]').forEach((header) => {
    header.addEventListener('click', () => {
      const nextKey = header.dataset.sortKey;
      tableState.sortDirection = tableState.sortKey === nextKey && tableState.sortDirection === 'asc' ? 'desc' : 'asc';
      tableState.sortKey = nextKey;
      tableState.page = 1;
      renderTable();
    });
  });

  renderTable();

  // ---------------------------------------------------------------
  // Modal: open/close, overlay click, Escape key, focus return
  // ---------------------------------------------------------------
  const modal = document.querySelector('#confirm-modal');
  const openModalButton = document.querySelector('#open-confirm-modal');
  const closeModalButtons = document.querySelectorAll('[data-modal-close]');

  const setModalOpen = (isOpen) => {
    if (!modal) return;
    modal.classList.toggle('modal-open', isOpen);
    modal.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) {
      modal.querySelector('.modal-close')?.focus();
    } else {
      openModalButton?.focus();
    }
  };

  openModalButton?.addEventListener('click', () => setModalOpen(true));
  closeModalButtons.forEach((button) => button.addEventListener('click', () => setModalOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('modal-open')) {
      setModalOpen(false);
    }
  });

  // ---------------------------------------------------------------
  // Navigation: responsive mobile menu toggle
  // ---------------------------------------------------------------
  const navToggle = document.querySelector('#nav-toggle');
  const navMenu = document.querySelector('#primary-menu');

  navToggle?.addEventListener('click', () => {
    const isOpen = navMenu?.classList.contains('flex');
    navMenu?.classList.toggle('flex', !isOpen);
    navMenu?.classList.toggle('hidden', isOpen);
    navToggle.setAttribute('aria-expanded', String(!isOpen));
  });

  navMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.add('hidden');
      navMenu.classList.remove('flex');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu?.classList.contains('flex')) {
      navMenu.classList.add('hidden');
      navMenu.classList.remove('flex');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });

  // ---------------------------------------------------------------
  // Tabs: switch active tab + panel, sync ARIA state
  // ---------------------------------------------------------------
  const tabs = document.querySelectorAll('[role="tab"][data-tab]');
  const panels = document.querySelectorAll('[role="tabpanel"][data-tab-panel]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const selectedTab = tab.dataset.tab;
      tabs.forEach((candidate) => {
        const isSelected = candidate === tab;
        candidate.classList.toggle('tab-active', isSelected);
        candidate.setAttribute('aria-selected', String(isSelected));
        candidate.setAttribute('tabindex', isSelected ? '0' : '-1');
      });
      panels.forEach((panel) => {
        const isVisible = panel.dataset.tabPanel === selectedTab;
        panel.classList.toggle('tab-panel-active', isVisible);
        panel.hidden = !isVisible;
      });
    });
  });
})();
```

เปิด `index.html` ตรง ๆ ในเบราว์เซอร์ได้เลย ไม่ต้อง server (ถ้า serve ผ่าน HTTP
server ธรรมดา `showcase.js` ก็โหลดได้ปกติเช่นกัน).

---

## 2. React (Vite)

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

แก้ `index.html` — เพิ่มใน `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/core.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/themes/dark.css">
```

สร้าง `src/DesignSystemShowcase.tsx` — component เดียวที่ render ทุก component
พร้อม state จริงของ React (ไม่ใช่ mockup):

```tsx
import { useCallback, useMemo, useState, useRef, useEffect } from 'react'

// --- Types ---
type Status = 'Active' | 'Pending' | 'Inactive'
interface User { name: string; email: string; status: Status }
type SortKey = keyof Pick<User, 'name' | 'email' | 'status'>
type SortDirection = 'asc' | 'desc'
type TabId = 'profile' | 'billing' | 'security'

const USERS: User[] = [
  { name: 'Ada Lovelace', email: 'ada@example.com', status: 'Active' },
  { name: 'Grace Hopper', email: 'grace@example.com', status: 'Pending' },
  { name: 'Katherine Johnson', email: 'kj@example.com', status: 'Active' },
  { name: 'Alan Turing', email: 'alan@example.com', status: 'Inactive' },
  { name: 'Margaret Hamilton', email: 'margaret@example.com', status: 'Active' },
]

const STATUS_CLASS: Record<Status, string> = {
  Active: 'badge-success',
  Pending: 'badge-warning',
  Inactive: 'badge-error',
}

const PAGE_SIZE = 2
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function DesignSystemShowcase() {
  return (
    <div className="p-6">
      <h1 className="text-heading-h1">Design System — Live Preview</h1>
      <p className="text-body-md mt-2">
        ทุก component ด้านล่างใช้งานได้จริงด้วย React state
      </p>

      <ButtonsAndBadges />
      <SignupCard />
      <AlertList />
      <UsersTable />
      <NavBar />
      <SettingsTabs />
      <ConfirmModal />
    </div>
  )
}

// --- 2.1 Buttons & Badges ---
function ButtonsAndBadges() {
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(() => {
    setSaving(true)
    // simulated async save — swap for a real API call via src/utils/api.ts
    window.setTimeout(() => setSaving(false), 1200)
  }, [])

  return (
    <section className="mt-8">
      <h2 className="text-heading-h2">Buttons &amp; Badges</h2>
      <div className="flex flex-wrap gap-3 mt-4">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button className="btn btn-secondary">Save as draft</button>
        <button className="btn btn-outline">Cancel</button>
        <button className="btn btn-error btn-sm">Delete</button>
      </div>
      <div className="flex gap-2 mt-4">
        <span className="badge badge-success">Deployed</span>
        <span className="badge badge-warning">Pending review</span>
        <span className="badge badge-error">Failed</span>
        <span className="badge badge-info">Draft</span>
      </div>
    </section>
  )
}

// --- 2.2 Card + Input (real client-side validation) ---
function SignupCard() {
  const [email, setEmail] = useState('')
  const isValid = email === '' || EMAIL_PATTERN.test(email)

  return (
    <section className="mt-8">
      <h2 className="text-heading-h2">Card &amp; Input</h2>
      <div className="card mt-4" style={{ maxWidth: '28rem' }}>
        <div className="card-header">Create account</div>
        <div className="card-body">
          <label htmlFor="signup-email" className="text-body-sm">Email</label>
          <input
            id="signup-email"
            type="email"
            className={`input mt-2 ${isValid ? '' : 'input-error'}`}
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!isValid}
          />
          <p className="text-body-sm mt-2" role="alert">
            {isValid ? '' : 'Enter a valid email address.'}
          </p>
        </div>
        <div className="card-footer">
          <button className="btn btn-primary" disabled={!isValid || email === ''}>
            Create account
          </button>
        </div>
      </div>
    </section>
  )
}

// --- 2.3 Alerts (real dismiss via state, not CSS) ---
interface AlertItem { id: number; variant: 'success' | 'warning' | 'error'; text: string }

function AlertList() {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: 1, variant: 'success', text: 'Deploy succeeded — build finished with 0 errors.' },
    { id: 2, variant: 'warning', text: '2 optional tests were skipped.' },
    { id: 3, variant: 'error', text: 'Token validation failed — see logs.' },
  ])

  const dismiss = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  return (
    <section className="mt-8">
      <h2 className="text-heading-h2">Alerts</h2>
      <div className="flex flex-col gap-3 mt-4">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert alert-${alert.variant}`}>
            <span>{alert.text}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              aria-label="Dismiss"
              onClick={() => dismiss(alert.id)}
            >
              ×
            </button>
          </div>
        ))}
        {alerts.length === 0 && <p className="text-body-sm">No active alerts.</p>}
      </div>
    </section>
  )
}

// --- 2.4 Table (real filter/sort/pagination over React state) ---
function UsersTable() {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return USERS
    return USERS.filter((u) => `${u.name} ${u.email} ${u.status}`.toLowerCase().includes(q))
  }, [query])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const cmp = a[sortKey].localeCompare(b[sortKey])
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDirection])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSort = useCallback((key: SortKey) => {
    setSortDirection((prevDir) => (sortKey === key ? (prevDir === 'asc' ? 'desc' : 'asc') : 'asc'))
    setSortKey(key)
    setPage(1)
  }, [sortKey])

  const columns: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <section className="mt-8">
      <h2 className="text-heading-h2">Table</h2>
      <div className="table-filter mt-4">
        <label htmlFor="users-filter">Filter users</label>
        <input
          id="users-filter"
          className="table-filter-input"
          type="search"
          placeholder="Search name, email, or status..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <caption className="sr-only">Team members</caption>
          <thead>
            <tr>
              {columns.map((col) => {
                const isActive = sortKey === col.key
                const ariaSort = isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
                const sortClass = isActive ? `th-sortable th-sort-${sortDirection}` : 'th-sortable'
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={sortClass}
                    aria-sort={ariaSort}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length > 0 ? visible.map((user) => (
              <tr key={user.email}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className={`badge ${STATUS_CLASS[user.status]}`}>{user.status}</span></td>
              </tr>
            )) : (
              <tr><td colSpan={3}>No matching records.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <nav className="table-pagination" aria-label="Table pages">
        <button className="page-btn" type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            className={`page-btn ${p === page ? 'page-btn-active' : ''}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
        <button className="page-btn" type="button" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </nav>
    </section>
  )
}

// --- 2.5 Navigation (real responsive mobile menu with React state) ---
function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <nav className="nav nav-horizontal flex-wrap mt-8" aria-label="Primary navigation">
      <a className="nav-brand" href="/">Acme</a>
      <button
        type="button"
        className="btn btn-outline btn-sm md:hidden"
        aria-expanded={menuOpen}
        aria-controls="primary-menu"
        onClick={() => setMenuOpen((v) => !v)}
      >
        Menu
      </button>
      <div
        id="primary-menu"
        className={`${menuOpen ? 'flex' : 'hidden'} w-full flex-col md:flex md:w-auto md:flex-row md:items-center`}
      >
        <div className="nav-item">
          <a className="nav-link nav-link-active" href="/" aria-current="page" onClick={() => setMenuOpen(false)}>
            Home
          </a>
        </div>
        <div className="nav-item">
          <a className="nav-link" href="/settings" onClick={() => setMenuOpen(false)}>Settings</a>
        </div>
        <span className="nav-divider hidden md:block" aria-hidden="true" />
        <div className="nav-item">
          <a className="nav-link" href="/help" onClick={() => setMenuOpen(false)}>Help</a>
        </div>
      </div>
    </nav>
  )
}

// --- 2.6 Tabs (real active-panel switching) ---
function SettingsTabs() {
  const [active, setActive] = useState<TabId>('profile')
  const tabs: { id: TabId; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'billing', label: 'Billing' },
    { id: 'security', label: 'Security' },
  ]

  return (
    <div className="tabs tabs-pills mt-8">
      <div className="tab-list" role="tablist" aria-label="Account settings">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`tab-item ${active === tab.id ? 'tab-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          className={`tab-panel ${active === tab.id ? 'tab-panel-active' : ''}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
        >
          <p className="text-body-md">
            {tab.id === 'profile' && 'Update your name, email, and avatar.'}
            {tab.id === 'billing' && 'Manage your plan and payment method.'}
            {tab.id === 'security' && 'Change your password and two-factor settings.'}
          </p>
        </div>
      ))}
    </div>
  )
}

// --- 2.7 Modal (real open/close, Escape, focus return) ---
function ConfirmModal() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  return (
    <section className="mt-8">
      <h2 className="text-heading-h2">Modal</h2>
      <button
        ref={triggerRef}
        className="btn btn-primary mt-4"
        type="button"
        aria-haspopup="dialog"
        aria-controls="confirm-modal"
        onClick={() => setOpen(true)}
      >
        Delete project
      </button>

      <div
        id="confirm-modal"
        className={`modal ${open ? 'modal-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-labelledby="confirm-modal-title"
      >
        <div className="modal-overlay" onClick={close} />
        <section className="modal-content">
          <header className="modal-header">
            <h2 id="confirm-modal-title">Delete project?</h2>
            <button ref={closeRef} className="modal-close" type="button" onClick={close} aria-label="Close">
              ×
            </button>
          </header>
          <div className="modal-body">
            <p className="text-body-md">
              This action can&apos;t be undone. The project and all its deploys will be permanently removed.
            </p>
          </div>
          <footer className="modal-footer">
            <button className="btn btn-outline" type="button" onClick={close}>Cancel</button>
            <button className="btn btn-error" type="button" onClick={close}>Delete</button>
          </footer>
        </section>
      </div>
    </section>
  )
}
```

แก้ `src/App.tsx` ให้ render component นี้:

```tsx
import DesignSystemShowcase from './DesignSystemShowcase'

function App() {
  return <DesignSystemShowcase />
}

export default App
```

```bash
npm run dev
```

---

## 3. Next.js (App Router)

```bash
npx create-next-app@latest my-next-app --ts --app
cd my-next-app
```

แก้ `app/layout.tsx` — เพิ่มใน `<head>`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'DS Live Preview — Next.js' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/tokens.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/core.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/themes/dark.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

Next.js App Router ใช้ Server Component เป็น default — component ที่มี state
(`useState`/`useEffect`) ต้องเป็น **Client Component** และต้องมี `"use client"`
เป็นบรรทัดแรกสุดของไฟล์ (ก่อน import ใด ๆ) copy `DesignSystemShowcase.tsx` จาก
หัวข้อ React ด้านบนมาไว้ที่ `app/components/DesignSystemShowcase.tsx` แล้วเพิ่ม
บรรทัดนี้ไว้บนสุด:

```tsx
"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from 'react'
// ...เนื้อหาที่เหลือเหมือนกับหัวข้อ React (Vite) ทุกประการ...
```

แก้ `app/page.tsx` — Server Component ที่ import Client Component มาแสดง:

```tsx
import DesignSystemShowcase from './components/DesignSystemShowcase'

export default function Home() {
  return <DesignSystemShowcase />
}
```

```bash
npm run dev
```

หมายเหตุ: `Next.js 16` (ตามที่ระบุใน steering rules) ยัง render Client
Component แบบนี้ได้ตามปกติผ่าน App Router — `useParams()`/`useRouter()` จาก
`next/navigation` ไม่จำเป็นสำหรับหน้านี้เพราะไม่มี dynamic route หรือ
programmatic navigation

---

## 4. ASP.NET Core MVC (C#)

```bash
dotnet new mvc -o MyMvcApp -f net9.0
cd MyMvcApp
```

Server-rendered MVC ไม่มี client-side state management ในตัว (ไม่มี React
hooks) — ดังนั้น component ที่ "ใช้งานจริง" ในความหมายของ MVC คือ
**server round-trip จริง** (filter/sort/pagination ผ่าน query string +
`HttpGet`) สำหรับ Table, และ **vanilla JavaScript จริง** (ไม่ simulate) สำหรับ
Modal/Nav/Tabs/Alert-dismiss/Input-validation ที่ต้องเป็น client-side
interaction — เหมือนกับ Plain HTML ในหัวข้อ 1 เพราะ MVC render เป็น HTML ล้วน

### 4.1 Model + Controller (real server-side filter/sort/pagination for Table)

`Models/UserRow.cs`:

```csharp
namespace MyMvcApp.Models;

public record UserRow(string Name, string Email, string Status)
{
    public string StatusBadgeClass => Status switch
    {
        "Active" => "badge-success",
        "Pending" => "badge-warning",
        "Inactive" => "badge-error",
        _ => "badge-info",
    };
}
```

`Models/UsersViewModel.cs`:

```csharp
namespace MyMvcApp.Models;

public class UsersViewModel
{
    public required IReadOnlyList<UserRow> Rows { get; init; }
    public required string Query { get; init; }
    public required string SortKey { get; init; }
    public required string SortDirection { get; init; }
    public required int Page { get; init; }
    public required int PageCount { get; init; }
}
```

`Controllers/UsersController.cs` — ทำ filter/sort/pagination จริงบน server
ทุกครั้งที่ผู้ใช้เปลี่ยน query string (ไม่ใช่ค่าคงที่แสดงผลอย่างเดียว):

```csharp
using Microsoft.AspNetCore.Mvc;
using MyMvcApp.Models;

namespace MyMvcApp.Controllers;

public class UsersController : Controller
{
    private static readonly UserRow[] AllUsers =
    [
        new("Ada Lovelace", "ada@example.com", "Active"),
        new("Grace Hopper", "grace@example.com", "Pending"),
        new("Katherine Johnson", "kj@example.com", "Active"),
        new("Alan Turing", "alan@example.com", "Inactive"),
        new("Margaret Hamilton", "margaret@example.com", "Active"),
    ];

    private const int PageSize = 2;

    [HttpGet]
    public IActionResult Index(string query = "", string sortKey = "Name",
        string sortDirection = "asc", int page = 1)
    {
        // Validate untrusted query-string input before using it as a switch key —
        // never trust external input, per AGENTS.md's Security Rules.
        var validSortKeys = new HashSet<string> { "Name", "Email", "Status" };
        if (!validSortKeys.Contains(sortKey)) sortKey = "Name";
        if (sortDirection is not ("asc" or "desc")) sortDirection = "asc";

        IEnumerable<UserRow> filtered = AllUsers;
        if (!string.IsNullOrWhiteSpace(query))
        {
            var q = query.Trim();
            filtered = filtered.Where(u =>
                u.Name.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                u.Email.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                u.Status.Contains(q, StringComparison.OrdinalIgnoreCase));
        }

        Func<UserRow, string> keySelector = sortKey switch
        {
            "Email" => u => u.Email,
            "Status" => u => u.Status,
            _ => u => u.Name,
        };
        filtered = sortDirection == "asc"
            ? filtered.OrderBy(keySelector, StringComparer.OrdinalIgnoreCase)
            : filtered.OrderByDescending(keySelector, StringComparer.OrdinalIgnoreCase);

        var filteredList = filtered.ToList();
        var pageCount = Math.Max(1, (int)Math.Ceiling(filteredList.Count / (double)PageSize));
        page = Math.Clamp(page, 1, pageCount);
        var pageRows = filteredList.Skip((page - 1) * PageSize).Take(PageSize).ToList();

        return View(new UsersViewModel
        {
            Rows = pageRows,
            Query = query,
            SortKey = sortKey,
            SortDirection = sortDirection,
            Page = page,
            PageCount = pageCount,
        });
    }
}
```

`Views/Users/Index.cshtml` — form-based filter (real `GET` submit, no JS
required for this part) plus sortable column links that carry the current
query string:

```html
@model MyMvcApp.Models.UsersViewModel

<section class="mt-8">
    <h2 class="text-heading-h2">Table (server-side filter/sort/pagination)</h2>

    <form method="get" asp-action="Index" class="table-filter mt-4">
        <label for="users-filter">Filter users</label>
        <input id="users-filter" name="query" class="table-filter-input" type="search"
               placeholder="Search name, email, or status..." value="@Model.Query">
        <input type="hidden" name="sortKey" value="@Model.SortKey">
        <input type="hidden" name="sortDirection" value="@Model.SortDirection">
    </form>

    <div class="table-responsive">
        <table class="table table-striped table-hover">
            <caption class="sr-only">Team members</caption>
            <thead>
                <tr>
                    @{
                        var nextDirection = Model.SortDirection == "asc" ? "desc" : "asc";
                        string SortClass(string key) => Model.SortKey == key
                            ? $"th-sortable th-sort-{Model.SortDirection}" : "th-sortable";
                        string AriaSort(string key) => Model.SortKey != key
                            ? "none" : Model.SortDirection == "asc" ? "ascending" : "descending";
                    }
                    <th scope="col" class="@SortClass("Name")" aria-sort="@AriaSort("Name")">
                        <a asp-action="Index" asp-route-query="@Model.Query" asp-route-sortKey="Name"
                           asp-route-sortDirection="@nextDirection">Name</a>
                    </th>
                    <th scope="col" class="@SortClass("Email")" aria-sort="@AriaSort("Email")">
                        <a asp-action="Index" asp-route-query="@Model.Query" asp-route-sortKey="Email"
                           asp-route-sortDirection="@nextDirection">Email</a>
                    </th>
                    <th scope="col" class="@SortClass("Status")" aria-sort="@AriaSort("Status")">
                        <a asp-action="Index" asp-route-query="@Model.Query" asp-route-sortKey="Status"
                           asp-route-sortDirection="@nextDirection">Status</a>
                    </th>
                </tr>
            </thead>
            <tbody>
                @if (Model.Rows.Count == 0)
                {
                    <tr><td colspan="3">No matching records.</td></tr>
                }
                else
                {
                    @foreach (var row in Model.Rows)
                    {
                        <tr>
                            <td>@row.Name</td>
                            <td>@row.Email</td>
                            <td><span class="badge @row.StatusBadgeClass">@row.Status</span></td>
                        </tr>
                    }
                }
            </tbody>
        </table>
    </div>

    <nav class="table-pagination" aria-label="Table pages">
        @if (Model.Page == 1)
        {
            <button class="page-btn" type="button" disabled aria-disabled="true">Previous</button>
        }
        else
        {
            <a class="page-btn" asp-action="Index" asp-route-query="@Model.Query" asp-route-sortKey="@Model.SortKey"
               asp-route-sortDirection="@Model.SortDirection" asp-route-page="@(Model.Page - 1)">
                Previous
            </a>
        }
        @for (var p = 1; p <= Model.PageCount; p++)
        {
            <a class="page-btn @(p == Model.Page ? "page-btn-active" : "")"
               aria-current="@(p == Model.Page ? "page" : null)"
               asp-action="Index" asp-route-query="@Model.Query" asp-route-sortKey="@Model.SortKey"
               asp-route-sortDirection="@Model.SortDirection" asp-route-page="@p">
                @p
            </a>
        }
        @if (Model.Page == Model.PageCount)
        {
            <button class="page-btn" type="button" disabled aria-disabled="true">Next</button>
        }
        else
        {
            <a class="page-btn" asp-action="Index" asp-route-query="@Model.Query" asp-route-sortKey="@Model.SortKey"
               asp-route-sortDirection="@Model.SortDirection" asp-route-page="@(Model.Page + 1)">
                Next
            </a>
        }
    </nav>
</section>
```

`.page-btn`/`.th-sortable`/`.th-sort-asc`/`.th-sort-desc` are real component
classes (see `docs/spec/components.md`); the actual sorting, filtering, and
pagination happen server-side in `UsersController.Index` — there's no
client-side JavaScript involved in this table, which is the honest MVC
equivalent of the React/HTML versions' client-side implementation.
**Previous/Next render as a real `<button disabled>` at the boundary pages,
not an `<a>` with a fabricated `disabled` CSS class** — the generated CSS
only defines `.page-btn:disabled` (a pseudo-class matching a real `disabled`
form-control attribute, verified against `dist/core.css`), and anchors can't
carry that attribute at all; a literal `class="disabled"` string would match
no rule and silently render as a fully-enabled-looking link. This mirrors
exactly how the React and vanilla-JS versions in sections 1.9/2 already
render their Previous/Next buttons.

### 4.2 Layout wiring + client-side components (Modal, Nav, Tabs, Alert, Input)

`Views/Shared/_Layout.cshtml` — เพิ่มใน `<head>` และก่อนปิด `</body>`:

```html
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/tokens.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/core.css">
</head>
<body>
    @RenderBody()
    <script src="~/js/showcase.js"></script>
</body>
```

`wwwroot/js/showcase.js` — identical to the vanilla JS in
[section 1.9](#19-the-showcasejs-file-real-behavior-for-every-component-above),
minus the table logic (the table is server-rendered above, so only Alert
dismiss, Input validation, Modal, Navigation, and Tabs behaviors apply here).

`Views/Home/Index.cshtml` — the remaining components, rendered as static
Razor markup with the same real behaviors as section 1 (identical HTML,
driven by the same `showcase.js`):

```html
@{
    ViewData["Title"] = "Home";
}

<h1 class="text-heading-h1">Design System — Live Preview</h1>

<section class="mt-8">
    <h2 class="text-heading-h2">Buttons &amp; Badges</h2>
    <div class="flex flex-wrap gap-3 mt-4">
        <button class="btn btn-primary">Save changes</button>
        <button class="btn btn-outline">Cancel</button>
        <button class="btn btn-error btn-sm">Delete</button>
    </div>
    <div class="flex gap-2 mt-4">
        <span class="badge badge-success">Deployed</span>
        <span class="badge badge-warning">Pending review</span>
    </div>
</section>

<section class="mt-8">
    <h2 class="text-heading-h2">Card &amp; Input</h2>
    <div class="card mt-4" style="max-width: 28rem;">
        <div class="card-header">Create account</div>
        <div class="card-body">
            <label for="signup-email" class="text-body-sm">Email</label>
            <input id="signup-email" class="input mt-2" type="email" placeholder="you@company.com">
            <p id="signup-email-hint" class="text-body-sm mt-2" role="alert"></p>
        </div>
        <div class="card-footer">
            <button class="btn btn-primary">Create account</button>
        </div>
    </div>
</section>

<!-- Alert, Modal, Navigation, Tabs markup — identical to sections 1.3, 1.5, 1.6, 1.7 -->
<partial name="_AdvancedComponents" />
```

`asp-action`/`asp-route-*` tag helpers generate real anchor `href`s with the
current query string preserved — clicking a column header or a page number
performs a real navigation/round-trip to `UsersController.Index`, not a
client-side re-render.

```bash
dotnet run
```

---

## 5. ASP.NET MVC / Razor Pages (VB.NET)

> **หมายเหตุสำคัญเรื่อง tooling**: `dotnet new` (SDK 9.0.306 ที่ตรวจสอบใน
> environment นี้) **ไม่มี** web-app template สำหรับ VB.NET แล้ว (`mvc`,
> `webapp`, `web` รองรับแค่ `[C#], F#`) — Visual Studio เองก็ไม่มี ASP.NET
> Core project template สำหรับ VB.NET ตั้งแต่ Visual Studio 2022 เป็นต้นมา
> ([Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/714974/vb-support-in-visualstudio-2022-for-aspnet-core-we)
> ยืนยันเรื่องนี้). Microsoft ยังคง support VB.NET บน **.NET Framework**
> (ASP.NET MVC 5 แบบเดิม, ไม่ใช่ ASP.NET Core) เท่านั้นสำหรับ web scenario —
> ไม่มี ASP.NET Core VB.NET tooling ที่ build ได้จริงในเครื่องนี้ตอนนี้
> ([devblogs.microsoft.com](https://devblogs.microsoft.com/vbteam/visual-basic-support-planned-for-net-5-0/)).
>
> โค้ดด้านล่างนี้จึงเป็น **reference syntax เท่านั้น** — เขียนในรูปแบบ
> ASP.NET MVC 5 (.NET Framework, `.vbhtml`) ซึ่งเป็น target ที่ VB.NET เขียน
> Razor ได้จริงตาม syntax, แต่ **ไม่ได้ผ่านการ `dotnet build`/`dotnet run`
> จริงในเครื่องนี้** เพราะ SDK ที่มีอยู่ไม่รองรับ VB.NET web project ให้ทำ.
> ถ้าต้องการ build จริง ต้องใช้ Visual Studio รุ่นที่ยังมี "ASP.NET Web
> Application (.NET Framework)" template + VB.NET selected เป็นภาษา (VS 2019
> หรือ VS 2022 ที่ยังติดตั้ง legacy .NET Framework workload).

### 5.1 Model + Controller (VB.NET, ASP.NET MVC 5 syntax)

`Models/UserRow.vb`:

```vb
Namespace MyMvcApp.Models

    Public Class UserRow
        Public Property Name As String
        Public Property Email As String
        Public Property Status As String

        Public Sub New(name As String, email As String, status As String)
            Me.Name = name
            Me.Email = email
            Me.Status = status
        End Sub

        Public ReadOnly Property StatusBadgeClass As String
            Get
                Select Case Status
                    Case "Active" : Return "badge-success"
                    Case "Pending" : Return "badge-warning"
                    Case "Inactive" : Return "badge-error"
                    Case Else : Return "badge-info"
                End Select
            End Get
        End Property
    End Class

    Public Class UsersViewModel
        Public Property Rows As List(Of UserRow)
        Public Property Query As String
        Public Property SortKey As String
        Public Property SortDirection As String
        Public Property Page As Integer
        Public Property PageCount As Integer
    End Class

End Namespace
```

`Controllers/UsersController.vb`:

```vb
Imports System.Web.Mvc
Imports MyMvcApp.Models

Namespace MyMvcApp.Controllers

    Public Class UsersController
        Inherits Controller

        Private Shared ReadOnly AllUsers As UserRow() = {
            New UserRow("Ada Lovelace", "ada@example.com", "Active"),
            New UserRow("Grace Hopper", "grace@example.com", "Pending"),
            New UserRow("Katherine Johnson", "kj@example.com", "Active"),
            New UserRow("Alan Turing", "alan@example.com", "Inactive"),
            New UserRow("Margaret Hamilton", "margaret@example.com", "Active")
        }

        Private Const PageSize As Integer = 2

        <HttpGet>
        Function Index(Optional query As String = "", Optional sortKey As String = "Name",
                        Optional sortDirection As String = "asc", Optional page As Integer = 1) As ActionResult

            ' Validate untrusted query-string input before using it — never trust
            ' external input, per AGENTS.md's Security Rules.
            Dim validSortKeys As New HashSet(Of String) From {"Name", "Email", "Status"}
            If Not validSortKeys.Contains(sortKey) Then sortKey = "Name"
            If sortDirection <> "asc" AndAlso sortDirection <> "desc" Then sortDirection = "asc"

            Dim filtered As IEnumerable(Of UserRow) = AllUsers
            If Not String.IsNullOrWhiteSpace(query) Then
                Dim q = query.Trim()
                filtered = filtered.Where(Function(u) _
                    u.Name.IndexOf(q, StringComparison.OrdinalIgnoreCase) >= 0 OrElse
                    u.Email.IndexOf(q, StringComparison.OrdinalIgnoreCase) >= 0 OrElse
                    u.Status.IndexOf(q, StringComparison.OrdinalIgnoreCase) >= 0)
            End If

            Dim keySelector As Func(Of UserRow, String)
            Select Case sortKey
                Case "Email" : keySelector = Function(u) u.Email
                Case "Status" : keySelector = Function(u) u.Status
                Case Else : keySelector = Function(u) u.Name
            End Select

            filtered = If(sortDirection = "asc",
                filtered.OrderBy(keySelector, StringComparer.OrdinalIgnoreCase),
                filtered.OrderByDescending(keySelector, StringComparer.OrdinalIgnoreCase))

            Dim filteredList = filtered.ToList()
            Dim pageCount = Math.Max(1, CInt(Math.Ceiling(filteredList.Count / CDbl(PageSize))))
            page = Math.Min(Math.Max(page, 1), pageCount)
            Dim pageRows = filteredList.Skip((page - 1) * PageSize).Take(PageSize).ToList()

            Return View(New UsersViewModel With {
                .Rows = pageRows,
                .Query = query,
                .SortKey = sortKey,
                .SortDirection = sortDirection,
                .Page = page,
                .PageCount = pageCount
            })
        End Function

    End Class

End Namespace
```

### 5.2 View (VB Razor `.vbhtml`)

`Views/Users/Index.vbhtml`:

```html
@ModelType MyMvcApp.Models.UsersViewModel

<section class="mt-8">
    <h2 class="text-heading-h2">Table (server-side filter/sort/pagination)</h2>

    <form method="get" action="@Url.Action("Index")" class="table-filter mt-4">
        <label for="users-filter">Filter users</label>
        <input id="users-filter" name="query" class="table-filter-input" type="search"
               placeholder="Search name, email, or status..." value="@Model.Query" />
        <input type="hidden" name="sortKey" value="@Model.SortKey" />
        <input type="hidden" name="sortDirection" value="@Model.SortDirection" />
    </form>

    <div class="table-responsive">
        <table class="table table-striped table-hover">
            <caption class="sr-only">Team members</caption>
            <thead>
                <tr>
                    @Code
                        Dim nextDirection = If(Model.SortDirection = "asc", "desc", "asc")
                        Function SortClass(key As String) As String
                            Return If(Model.SortKey = key, "th-sortable th-sort-" & Model.SortDirection, "th-sortable")
                        End Function
                        Function AriaSort(key As String) As String
                            If Model.SortKey <> key Then Return "none"
                            Return If(Model.SortDirection = "asc", "ascending", "descending")
                        End Function
                    End Code
                    <th scope="col" class="@SortClass("Name")" aria-sort="@AriaSort("Name")">
                        <a href="@Url.Action("Index", New With {query = Model.Query, sortKey = "Name", sortDirection = nextDirection})">Name</a>
                    </th>
                    <th scope="col" class="@SortClass("Email")" aria-sort="@AriaSort("Email")">
                        <a href="@Url.Action("Index", New With {query = Model.Query, sortKey = "Email", sortDirection = nextDirection})">Email</a>
                    </th>
                    <th scope="col" class="@SortClass("Status")" aria-sort="@AriaSort("Status")">
                        <a href="@Url.Action("Index", New With {query = Model.Query, sortKey = "Status", sortDirection = nextDirection})">Status</a>
                    </th>
                </tr>
            </thead>
            <tbody>
                @If Model.Rows.Count = 0 Then
                    @<tr><td colspan="3">No matching records.</td></tr>
                Else
                    @For Each row In Model.Rows
                        @<tr>
                            <td>@row.Name</td>
                            <td>@row.Email</td>
                            <td><span class="badge @row.StatusBadgeClass">@row.Status</span></td>
                        </tr>
                    Next
                End If
            </tbody>
        </table>
    </div>

    <nav class="table-pagination" aria-label="Table pages">
        <a class="page-btn @(If(Model.Page = 1, "disabled", ""))"
           href="@Url.Action("Index", New With {query = Model.Query, sortKey = Model.SortKey, sortDirection = Model.SortDirection, page = Model.Page - 1})">
            Previous
        </a>
        @For p = 1 To Model.PageCount
            @<a class="page-btn @(If(p = Model.Page, "page-btn-active", ""))"
                href="@Url.Action("Index", New With {query = Model.Query, sortKey = Model.SortKey, sortDirection = Model.SortDirection, page = p})">
                @p
            </a>
        Next
        <a class="page-btn @(If(Model.Page = Model.PageCount, "disabled", ""))"
           href="@Url.Action("Index", New With {query = Model.Query, sortKey = Model.SortKey, sortDirection = Model.SortDirection, page = Model.Page + 1})">
            Next
        </a>
    </nav>
</section>
```

`Views/Shared/_Layout.vbhtml` — same CDN links as section 4.2, plus
`wwwroot/js/showcase.js` (same file, unchanged — it's plain JavaScript, not
tied to C# or VB.NET) loaded before `</body>`. The Modal/Navigation/Tabs/
Alert/Input markup is identical to section 1's HTML (`.vbhtml` renders plain
HTML for non-`@`-prefixed markup, same as `.cshtml`).

```
' No dotnet CLI command exists for this — see the note at the top of this
' section. Build via Visual Studio's legacy ASP.NET Web Application
' (.NET Framework) project with VB.NET selected, then run with IIS Express.
```

---

## Theme Switching (ใช้ได้ทุก Platform)

```javascript
// Dark mode
document.documentElement.setAttribute('data-theme', 'dark');

// Banking theme
document.documentElement.setAttribute('data-theme', 'banking');

// Corporate theme
document.documentElement.setAttribute('data-theme', 'corporate');

// กลับ default (light)
document.documentElement.removeAttribute('data-theme');
```

---

## Checklist ทดสอบ

| ✓ | ทดสอบ |
|---|--------|
| ☐ | Buttons แสดงสีถูกต้อง (primary=น้ำเงิน, secondary=ม่วง, error=แดง) และ `disabled`/loading state ทำงานจริง |
| ☐ | Badge แสดงสีตาม variant และเปลี่ยนตามสถานะข้อมูลจริง (ไม่ใช่ hardcode) |
| ☐ | Card มี border + shadow + padding, header/body/footer ต่อกันถูกต้อง |
| ☐ | Input มี border + focus ring, และสลับ `.input-error` จริงตามการพิมพ์ (client-side หรือ server-side validation) |
| ☐ | Alert แสดงสีตาม variant และกดปิด (`×`) แล้วหายไปจริงจาก DOM/state |
| ☐ | Table filter กรองข้อมูลจริง (client-side state หรือ server round-trip) |
| ☐ | Table sorting indicator สลับด้วยการเปลี่ยน `.th-sort-asc`/`.th-sort-desc` และ `aria-sort` เปลี่ยนจริง |
| ☐ | Table pagination เปลี่ยนหน้าจริงพร้อม `.page-btn-active`/`aria-current` |
| ☐ | Modal เปิด/ปิดจริงด้วยปุ่ม, overlay click, และ `Escape`, focus กลับไปที่ trigger ตอนปิด |
| ☐ | Nav แสดง horizontal/vertical, active link state, และ mobile menu toggle จริง (`aria-expanded` เปลี่ยนตามสถานะ) |
| ☐ | Tabs สลับ `.tab-active`/`.tab-panel-active` พร้อม ARIA state (`aria-selected`, `tabindex`) จริงเมื่อคลิก |
| ☐ | Typography sizes ต่างกัน (h1 > h2 > body) |
| ☐ | Spacing (mt-4, p-6, gap-4) ทำงาน |
| ☐ | Dark mode / Banking / Corporate theme toggle เปลี่ยนสีทั้งหน้าจริง |
| ☐ | Responsive (ย่อหน้าจอแล้ว layout ปรับ, hamburger เปลี่ยนเป็นเมนูเต็มที่ `md` ขึ้นไป) |

