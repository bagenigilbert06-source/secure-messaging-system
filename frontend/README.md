# Frontend - Luxury Landing Page Project

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   └── auth/                 # Authentication endpoints
│   │   │       └── login/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/
│   │   ├── ui/                       # Shadcn UI Components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   └── ... (other UI components)
│   │   │
│   │   ├── landing/                  # Landing page components
│   │   │   └── landing-page.tsx
│   │   │
│   │   ├── auth/                     # Authentication components
│   │   │   └── premium-auth.tsx
│   │   │
│   │   ├── student/                  # Student dashboard components
│   │   │   └── complete-student-dashboard.tsx
│   │   │
│   │   └── theme/                    # Theme provider
│   │       └── theme-provider.tsx
│   │
│   ├── lib/                          # Utilities and helpers
│   │   ├── utils.ts                  # Common utilities (cn function)
│   │   └── dummy-data.ts             # Mock data
│   │
│   └── hooks/                        # Custom React hooks
│       └── use-toast.ts
│
├── public/                           # Static assets (if any)
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── next.config.mjs                   # Next.js configuration
├── postcss.config.mjs                # PostCSS configuration
└── package.json                      # Dependencies

```

## Getting Started

### Installation

```bash
cd frontend
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
pnpm start
```

## Organization Benefits

- **Clear Separation of Concerns**: Components are organized by feature/domain
- **Easy Navigation**: Find files quickly with logical folder structure
- **Scalability**: Easy to add new features without cluttering the root directory
- **Maintainability**: Related files are grouped together
- **Type Safety**: TypeScript paths are configured for clean imports

## Import Paths

All imports use the `@/` alias which points to `./src/`:

```typescript
// Instead of:
import { LandingPage } from '../../../components/landing/landing-page'

// Use:
import { LandingPage } from '@/components/landing/landing-page'
```

## Component Categories

### UI Components (`@/components/ui/`)
Reusable shadcn UI components with Tailwind CSS styling.

### Landing Components (`@/components/landing/`)
Components specific to the landing page.

### Auth Components (`@/components/auth/`)
Authentication-related components.

### Student Components (`@/components/student/`)
Student dashboard and related features.

### Utilities (`@/lib/`)
Helper functions, constants, and data utilities.

### Hooks (`@/hooks/`)
Custom React hooks for common functionality.

## Development Tips

1. **Keep components focused**: Each component should have a single responsibility
2. **Reuse UI components**: Use the shadcn UI components from `@/components/ui/`
3. **Extract complex logic**: Move business logic to custom hooks in `@/hooks/`
4. **Use TypeScript**: Take advantage of type safety with TypeScript
5. **Import organization**: Use the `@/` alias for all imports

## Next Steps

- Customize theme colors in `globals.css`
- Update page content in `src/app/page.tsx`
- Add new pages in `src/app/` directory
- Create feature-specific components in their respective folders

---

For more information, visit the [Next.js documentation](https://nextjs.org/docs).
