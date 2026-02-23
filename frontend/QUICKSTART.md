# Quick Start Guide

## 🚀 Get Running in 30 Seconds

### 1. Navigate to Frontend
```bash
cd frontend
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Start Development Server
```bash
pnpm dev
```

### 4. Open in Browser
Visit: [http://localhost:3000](http://localhost:3000)

---

## 📁 Where to Find Things

| What | Where |
|------|-------|
| Home Page | `src/app/page.tsx` |
| Global Styles | `src/app/globals.css` |
| Button Component | `src/components/ui/button.tsx` |
| Landing Page | `src/components/landing/landing-page.tsx` |
| Authentication | `src/components/auth/premium-auth.tsx` |
| Student Dashboard | `src/components/student/complete-student-dashboard.tsx` |
| Utilities | `src/lib/utils.ts` |
| Hooks | `src/hooks/use-toast.ts` |

---

## 💡 Common Tasks

### Edit the Home Page
```typescript
// src/app/page.tsx
import { LandingPage } from '@/components/landing/landing-page'

export default function Home() {
  return <LandingPage />
}
```

### Use a Button Component
```typescript
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return <Button onClick={() => alert('Clicked!')}>Click me</Button>
}
```

### Create a New Component
```typescript
// src/components/landing/my-component.tsx
export function MyComponent() {
  return <div>My new component</div>
}

// Use it in page.tsx
import { MyComponent } from '@/components/landing/my-component'
```

### Use the Toast Hook
```typescript
import { useToast } from '@/hooks/use-toast'

export function MyComponent() {
  const { toast } = useToast()
  
  return (
    <button onClick={() => toast({ title: 'Hello!' })}>
      Show Toast
    </button>
  )
}
```

### Check Responsive Design
```typescript
import { useIsMobile } from '@/hooks/use-mobile'

export function MyComponent() {
  const isMobile = useIsMobile()
  
  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>
}
```

---

## 🎨 Styling

### Using Tailwind CSS
```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Tailwind styled div
</div>
```

### Using the `cn` Utility
```typescript
import { cn } from '@/lib/utils'

export function MyComponent({ isActive }: { isActive: boolean }) {
  return (
    <div className={cn(
      'p-4 rounded-lg',
      isActive ? 'bg-blue-500' : 'bg-gray-200'
    )}>
      Dynamic styles
    </div>
  )
}
```

---

## 📦 Install New UI Component

Need a new shadcn component? Use the CLI:

```bash
npx shadcn-ui@latest add <component-name>
```

This will add the component to `src/components/ui/`.

---

## 🔧 Available Commands

```bash
# Development
pnpm dev        # Start dev server with hot reload

# Production
pnpm build      # Build for production
pnpm start      # Run production build

# Linting
pnpm lint       # Run ESLint
```

---

## 📚 Key Files

- **`tsconfig.json`**: TypeScript config with `@/` path alias
- **`tailwind.config.ts`**: Tailwind CSS configuration
- **`next.config.mjs`**: Next.js configuration
- **`package.json`**: Dependencies and scripts

---

## 🆘 Troubleshooting

### Port 3000 already in use?
```bash
pnpm dev -- -p 3001
```

### Import error for `@/`?
Make sure you're in the `frontend` folder when starting the dev server.

### Styles not loading?
Check that `tailwind.config.ts` includes `./src/**/*.tsx` in the content array.

### Component not found?
Verify the component exists at the path you're importing from.

---

## 📖 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)
- See `README.md` for full documentation

---

Happy coding! 🎉
