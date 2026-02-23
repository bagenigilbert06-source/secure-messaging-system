# Complete Folder Structure Overview

## Project Layout

```
v0-project/
│
├── frontend/                              # ⭐ NEW - Main application folder
│   │
│   ├── src/                               # Source code directory
│   │   │
│   │   ├── app/                           # Next.js App Router
│   │   │   ├── api/
│   │   │   │   └── auth/
│   │   │   │       └── login/
│   │   │   │           └── route.ts       # Login API endpoint
│   │   │   ├── layout.tsx                 # Root layout component
│   │   │   ├── page.tsx                   # Home/index page
│   │   │   └── globals.css                # Global styles & design tokens
│   │   │
│   │   ├── components/                    # React components
│   │   │   │
│   │   │   ├── ui/                        # Shadcn UI components (reusable)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── toaster.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   └── ... (other UI components)
│   │   │   │
│   │   │   ├── landing/                   # Landing page features
│   │   │   │   └── landing-page.tsx       # Main landing page component
│   │   │   │
│   │   │   ├── auth/                      # Authentication features
│   │   │   │   └── premium-auth.tsx       # Auth component
│   │   │   │
│   │   │   ├── student/                   # Student dashboard features
│   │   │   │   └── complete-student-dashboard.tsx
│   │   │   │
│   │   │   └── theme/                     # Theme management
│   │   │       └── theme-provider.tsx     # Theme context provider
│   │   │
│   │   ├── lib/                           # Utilities & helpers
│   │   │   ├── utils.ts                   # Common utilities (cn function)
│   │   │   └── dummy-data.ts              # Mock/test data
│   │   │
│   │   └── hooks/                         # Custom React hooks
│   │       ├── use-toast.ts               # Toast notification hook
│   │       └── use-mobile.tsx             # Mobile detection hook
│   │
│   ├── public/                            # Static assets (images, fonts, etc)
│   │
│   ├── .gitignore                         # Git ignore rules
│   ├── .next/                             # Next.js build output (auto-generated)
│   ├── node_modules/                      # Dependencies (auto-generated)
│   ├── .env.local                         # Local environment variables (optional)
│   │
│   ├── next.config.mjs                    # Next.js configuration
│   ├── tsconfig.json                      # TypeScript configuration (paths: @/* -> ./src/*)
│   ├── tailwind.config.ts                 # Tailwind CSS configuration
│   ├── postcss.config.mjs                 # PostCSS configuration
│   ├── package.json                       # Dependencies & scripts
│   │
│   └── README.md                          # Frontend documentation
│
├── .gitignore                             # Root git ignore
├── MIGRATION.md                           # Migration guide (this document)
├── FOLDER_STRUCTURE.md                    # This file
│
└── [OLD FILES - for reference]            # Original files (can be deleted)
    ├── app/
    ├── components/
    ├── lib/
    ├── hooks/
    └── public/

```

## Component Organization Strategy

### 1. **UI Components** (`components/ui/`)
   - **Purpose**: Reusable, unstyled or lightly styled components from Shadcn
   - **Contains**: Button, Card, Input, Form, Dialog, etc.
   - **Usage**: Import in any component that needs them
   - **Example**: `import { Button } from '@/components/ui/button'`

### 2. **Feature Components** (by domain)
   - **`components/landing/`**: Landing page specific components
   - **`components/auth/`**: Authentication related components
   - **`components/student/`**: Student dashboard components
   - **`components/theme/`**: Theme providers and theme-related components

### 3. **Utilities** (`lib/`)
   - **utils.ts**: Helper functions like `cn()` for class merging
   - **dummy-data.ts**: Mock data for development/testing
   - **Add more as needed**: Constants, validators, formatters, etc.

### 4. **Custom Hooks** (`hooks/`)
   - **use-toast.ts**: Toast notification management
   - **use-mobile.tsx**: Responsive design hook
   - **Add more as needed**: Custom state management, API calls, etc.

## Import Path Examples

All imports should use the `@/` alias which points to `./src/`:

```typescript
// ✅ GOOD - Using @/ alias
import { Button } from '@/components/ui/button'
import { LandingPage } from '@/components/landing/landing-page'
import { premiumAuth } from '@/components/auth/premium-auth'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// ❌ AVOID - Using relative paths
import { Button } from '../../../components/ui/button'
import { LandingPage } from '../../components/landing/landing-page'
```

## Development Workflow

### Starting Development
```bash
cd frontend
pnpm install      # First time only
pnpm dev         # Start dev server
```

### Adding a New Feature
1. Create a folder in `components/` for your feature (e.g., `components/pricing/`)
2. Create component files inside that folder
3. Import UI components and utilities as needed
4. Export components from a barrel file if needed (optional)

### Creating a New Page
```typescript
// frontend/src/app/new-page/page.tsx
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'

export default function NewPage() {
  return (
    <div>
      <Header />
      {/* Page content */}
      <Footer />
    </div>
  )
}
```

## Key Paths Configuration

The `tsconfig.json` in the frontend folder contains:
```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

This allows all imports to use `@/` which resolves to `./src/`

## Build & Deployment

### Development Build
```bash
cd frontend
pnpm dev
```

### Production Build
```bash
cd frontend
pnpm build
pnpm start
```

The `.next` folder contains all build artifacts.

## Environment Variables

Create a `.env.local` file in the `frontend` folder (not committed to git):
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Best Practices

✅ **DO:**
- Keep components focused and single-responsibility
- Use TypeScript for type safety
- Follow the folder structure for new features
- Use the `@/` import alias
- Keep styles in components or `globals.css`

❌ **DON'T:**
- Mix business logic with UI components
- Use relative imports (../../)
- Put everything in one folder
- Mix component types in one folder

## Scalability

This structure scales well for:
- ✅ Small projects (current state)
- ✅ Medium projects (add more feature folders)
- ✅ Large projects (add sub-folders within features)

For very large projects, consider:
- Adding a `pages/` folder for page-specific components
- Creating a `services/` folder for API calls
- Adding a `stores/` folder for state management (if using Zustand, Redux, etc.)
- Creating a `types/` folder for TypeScript types

---

## Migration Checklist

- [x] Folder structure created
- [x] All components copied to correct locations
- [x] Configuration files set up
- [x] Import paths configured with `@/` alias
- [x] Documentation created
- [ ] Test that dev server starts
- [ ] Verify all features work
- [ ] Delete old root-level folders if confident
- [ ] Commit to version control

---

**Last Updated:** February 2026
**Structure Version:** 1.0.0
