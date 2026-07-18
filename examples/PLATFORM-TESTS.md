# Platform Test — Company Design System

ไฟล์นี้รวมตัวอย่างโค้ดสำหรับทดสอบ Design System บนทุก Supported Platform

CDN URLs (ใช้ branch `features/dev`):

```
https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/tokens.css
https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/core.css
https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/themes/dark.css
```

---

## 1. Plain HTML (Static)

สร้างไฟล์ `index.html`:

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DS Test — Plain HTML</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/tokens.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/core.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/themes/dark.css">
</head>
<body class="p-8">
  <h1 class="text-heading-h1">Plain HTML Test</h1>
  <p class="text-body-md mt-2">ถ้าเห็น styling = ใช้งานได้</p>

  <div class="flex gap-4 mt-6">
    <button class="btn btn-primary">Primary</button>
    <button class="btn btn-secondary">Secondary</button>
    <button class="btn btn-error">Error</button>
  </div>

  <div class="card p-6 mt-6">
    <h2 class="text-heading-h2">Card</h2>
    <p class="text-body-md mt-2">Card content.</p>
    <input class="input mt-4" placeholder="Input..." />
  </div>

  <div class="flex gap-2 mt-6">
    <span class="badge badge-success">Success</span>
    <span class="badge badge-warning">Warning</span>
    <span class="badge badge-error">Error</span>
    <span class="badge badge-info">Info</span>
  </div>

  <div class="alert alert-info mt-4">Info alert</div>
  <div class="alert alert-success mt-2">Success alert</div>

  <script>
    // Toggle dark mode
    // document.documentElement.setAttribute('data-theme', 'dark');
  </script>
</body>
</html>
```

เปิดไฟล์ตรง ๆ ในเบราว์เซอร์ได้เลย ไม่ต้อง server

---

## 2. React (Vite)

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

แก้ `index.html` — เพิ่มใน `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/core.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/themes/dark.css">
```

แก้ `src/App.tsx`:

```tsx
function App() {
  return (
    <div className="p-8">
      <h1 className="text-heading-h1">React + Design System</h1>
      <p className="text-body-md mt-2">Working!</p>

      <div className="flex gap-4 mt-6">
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
      </div>

      <div className="card p-6 mt-6">
        <h2 className="text-heading-h2">Card Component</h2>
        <input className="input mt-4" placeholder="Type here..." />
      </div>

      <div className="alert alert-success mt-4">React works with DS!</div>
    </div>
  )
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

export const metadata: Metadata = { title: 'DS Test — Next.js' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/tokens.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/core.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/themes/dark.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

แก้ `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-heading-h1">Next.js + Design System</h1>
      <button className="btn btn-primary mt-4">Click me</button>
      <div className="card p-6 mt-6">
        <h2 className="text-heading-h2">Server Component Card</h2>
        <p className="text-body-md mt-2">Works with App Router!</p>
      </div>
    </main>
  )
}
```

```bash
npm run dev
```

---

## 4. Vue (Vite)

```bash
npm create vite@latest my-vue-app -- --template vue-ts
cd my-vue-app
npm install
```

แก้ `index.html` — เพิ่มใน `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/core.css">
```

แก้ `src/App.vue`:

```vue
<template>
  <div class="p-8">
    <h1 class="text-heading-h1">Vue + Design System</h1>
    <p class="text-body-md mt-2">ทำงานได้!</p>

    <div class="flex gap-4 mt-6">
      <button class="btn btn-primary" @click="count++">Clicked {{ count }} times</button>
      <button class="btn btn-secondary" @click="count = 0">Reset</button>
    </div>

    <div class="card p-6 mt-6">
      <h2 class="text-heading-h2">Vue Card</h2>
      <input class="input mt-4" v-model="message" placeholder="Type..." />
      <p class="text-body-md mt-2">{{ message }}</p>
    </div>

    <div class="alert alert-info mt-4">Vue integration complete</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
const message = ref('')
</script>
```

```bash
npm run dev
```

---

## 5. Angular

```bash
ng new my-angular-app --style=css --routing=false --ssr=false
cd my-angular-app
```

แก้ `src/index.html` — เพิ่มใน `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/core.css">
```

แก้ `src/app/app.component.html`:

```html
<div class="p-8">
  <h1 class="text-heading-h1">Angular + Design System</h1>
  <p class="text-body-md mt-2">Working!</p>

  <div class="flex gap-4 mt-6">
    <button class="btn btn-primary" (click)="count = count + 1">Count: {{ count }}</button>
    <button class="btn btn-error" (click)="count = 0">Reset</button>
  </div>

  <div class="card p-6 mt-6">
    <h2 class="text-heading-h2">Angular Card</h2>
    <input class="input mt-4" [(ngModel)]="name" placeholder="Your name" />
    <p class="text-body-md mt-2">Hello, {{ name }}!</p>
  </div>
</div>
```

```bash
ng serve
```

---

## 6. Svelte (Vite)

```bash
npm create vite@latest my-svelte-app -- --template svelte-ts
cd my-svelte-app
npm install
```

แก้ `index.html` — เพิ่มใน `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/core.css">
```

แก้ `src/App.svelte`:

```svelte
<script lang="ts">
  let count = 0
  let theme = ''

  function toggleTheme() {
    theme = theme === 'dark' ? '' : 'dark'
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme)
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }
</script>

<div class="p-8">
  <h1 class="text-heading-h1">Svelte + Design System</h1>

  <div class="flex gap-4 mt-6">
    <button class="btn btn-primary" on:click={() => count++}>Count: {count}</button>
    <button class="btn btn-secondary" on:click={toggleTheme}>Toggle Dark</button>
  </div>

  <div class="card p-6 mt-6">
    <h2 class="text-heading-h2">Svelte Card</h2>
    <p class="text-body-md mt-2">Reactive and styled!</p>
  </div>

  <div class="alert alert-success mt-4">Svelte works!</div>
</div>
```

```bash
npm run dev
```

---

## 7. Blazor (ASP.NET)

```bash
dotnet new blazorwasm -o MyBlazorApp
cd MyBlazorApp
```

แก้ `wwwroot/index.html` — เพิ่มใน `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/core.css">
```

แก้ `Pages/Index.razor`:

```razor
@page "/"

<div class="p-8">
    <h1 class="text-heading-h1">Blazor + Design System</h1>
    <p class="text-body-md mt-2">Working from .NET!</p>

    <div class="flex gap-4 mt-6">
        <button class="btn btn-primary" @onclick="Increment">Count: @count</button>
        <button class="btn btn-error" @onclick="Reset">Reset</button>
    </div>

    <div class="card p-6 mt-6">
        <h2 class="text-heading-h2">Blazor Card</h2>
        <input class="input mt-4" @bind="name" placeholder="Enter name" />
        <p class="text-body-md mt-2">Hello, @name!</p>
    </div>

    <div class="alert alert-info mt-4">Blazor WASM integration</div>
</div>

@code {
    private int count = 0;
    private string name = "";
    private void Increment() => count++;
    private void Reset() => count = 0;
}
```

```bash
dotnet run
```

---

## 8. ASP.NET MVC / Razor Pages

```bash
dotnet new webapp -o MyRazorApp
cd MyRazorApp
```

แก้ `Pages/Shared/_Layout.cshtml` — เพิ่มใน `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/core.css">
```

แก้ `Pages/Index.cshtml`:

```html
@page
@model IndexModel

<div class="p-8">
    <h1 class="text-heading-h1">ASP.NET Razor + Design System</h1>
    <p class="text-body-md mt-2">Server-rendered with DS classes</p>

    <div class="flex gap-4 mt-6">
        <button class="btn btn-primary">Action</button>
        <a href="/Privacy" class="btn btn-secondary">Privacy</a>
    </div>

    <div class="card p-6 mt-6">
        <h2 class="text-heading-h2">Razor Page Card</h2>
        <p class="text-body-md mt-2">Works with server-side rendering!</p>
    </div>

    <div class="alert alert-success mt-4">ASP.NET integration complete</div>
</div>
```

```bash
dotnet run
```

---

## 9. Laravel (Blade)

```bash
composer create-project laravel/laravel my-laravel-app
cd my-laravel-app
```

แก้ `resources/views/layouts/app.blade.php` — เพิ่มใน `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@features/dev/dist/core.css">
```

สร้าง `resources/views/test.blade.php`:

```html
@extends('layouts.app')

@section('content')
<div class="p-8">
    <h1 class="text-heading-h1">Laravel + Design System</h1>
    <p class="text-body-md mt-2">Blade template with DS classes</p>

    <div class="flex gap-4 mt-6">
        <a href="/" class="btn btn-primary">Home</a>
        <a href="/about" class="btn btn-secondary">About</a>
    </div>

    <div class="card p-6 mt-6">
        <h2 class="text-heading-h2">Laravel Card</h2>
        <p class="text-body-md mt-2">Server-rendered via Blade</p>
        <input class="input mt-4" name="search" placeholder="Search..." />
    </div>

    <div class="alert alert-warning mt-4">Laravel integration ready</div>
</div>
@endsection
```

```bash
php artisan serve
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
| ☐ | Buttons แสดงสีถูกต้อง (primary=น้ำเงิน, secondary=ม่วง, error=แดง) |
| ☐ | Card มี border + shadow + padding |
| ☐ | Input มี border + focus ring |
| ☐ | Badge แสดงสีตาม variant |
| ☐ | Alert แสดงสีตาม variant |
| ☐ | Typography sizes ต่างกัน (h1 > h2 > body) |
| ☐ | Spacing (mt-4, p-6, gap-4) ทำงาน |
| ☐ | Flex layout จัดเรียงถูก |
| ☐ | Dark mode toggle เปลี่ยนสีทั้งหน้า |
| ☐ | Responsive (ย่อหน้าจอแล้ว layout ปรับ) |
