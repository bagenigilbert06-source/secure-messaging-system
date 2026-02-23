# ✅ Setup Verification Checklist

Use this checklist to verify that your frontend setup is complete and working correctly.

---

## 🔍 Folder Structure Verification

### Core Folders
- [ ] `src/` folder exists
- [ ] `src/app/` folder exists
- [ ] `src/components/` folder exists
- [ ] `src/lib/` folder exists
- [ ] `src/hooks/` folder exists
- [ ] `public/` folder exists (optional)

### Component Subfolders
- [ ] `src/components/ui/` exists with UI components
- [ ] `src/components/landing/` exists
- [ ] `src/components/auth/` exists
- [ ] `src/components/student/` exists
- [ ] `src/components/theme/` exists

### Key Files
- [ ] `src/app/page.tsx` exists
- [ ] `src/app/layout.tsx` exists
- [ ] `src/app/globals.css` exists

---

## 📋 Configuration Files Verification

### Present in `frontend/` root
- [ ] `package.json` exists
- [ ] `tsconfig.json` exists
- [ ] `tailwind.config.ts` exists
- [ ] `next.config.mjs` exists
- [ ] `postcss.config.mjs` exists
- [ ] `.gitignore` exists

### TypeScript Configuration
- [ ] `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }`
- [ ] Paths point to `./src/` (not `./` or `../src/`)

### Tailwind Configuration
- [ ] `tailwind.config.ts` includes `./src/**/*.{js,ts,jsx,tsx}`
- [ ] Content paths are correct for `src/` folder

### Package.json
- [ ] Has `"next"` dependency
- [ ] Has `"react"` dependency
- [ ] Has `"tailwindcss"` dependency
- [ ] Has `"typescript"` dependency
- [ ] `"dev"` script points to `next dev`

---

## 📦 Components Verification

### UI Components Present
- [ ] `src/components/ui/button.tsx`
- [ ] `src/components/ui/card.tsx`
- [ ] `src/components/ui/input.tsx`
- [ ] `src/components/ui/form.tsx`
- [ ] `src/components/ui/dialog.tsx`
- [ ] `src/components/ui/tabs.tsx`
- [ ] `src/components/ui/accordion.tsx`

### Feature Components Present
- [ ] `src/components/landing/landing-page.tsx`
- [ ] `src/components/auth/premium-auth.tsx`
- [ ] `src/components/student/complete-student-dashboard.tsx`

### Theme Components Present
- [ ] `src/components/theme/theme-provider.tsx`

---

## 🛠️ Utilities & Hooks Verification

### Libraries Present
- [ ] `src/lib/utils.ts` exists
- [ ] `src/lib/utils.ts` contains `cn()` function
- [ ] `src/lib/dummy-data.ts` exists

### Hooks Present
- [ ] `src/hooks/use-toast.ts` exists
- [ ] `src/hooks/use-mobile.tsx` exists

---

## 📝 Dependencies Verification

### Install and Check

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```
   - [ ] No error messages
   - [ ] `node_modules/` folder created
   - [ ] `pnpm-lock.yaml` generated

3. **Check key packages installed**
   ```bash
   ls node_modules | grep next
   ls node_modules | grep react
   ls node_modules | grep tailwindcss
   ```
   - [ ] `next` is installed
   - [ ] `react` is installed
   - [ ] `react-dom` is installed
   - [ ] `tailwindcss` is installed

---

## 🚀 Development Server Verification

### Start Development Server
```bash
pnpm dev
```

- [ ] No build errors
- [ ] Server starts on `http://localhost:3000`
- [ ] Terminal shows `Local: http://localhost:3000`
- [ ] Page loads in browser
- [ ] No console errors
- [ ] Hot reload works (edit file → see changes immediately)

---

## 🔗 Import Paths Verification

### Test in `src/app/page.tsx`

```typescript
// These imports should work (no red squiggles in IDE)
import { Button } from '@/components/ui/button'
import { LandingPage } from '@/components/landing/landing-page'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
```

- [ ] All `@/` imports resolve correctly
- [ ] No "Cannot find module" errors in IDE
- [ ] No errors when running `pnpm dev`

---

## 🎨 Styling Verification

### Tailwind CSS

1. **Add test class to element**
   ```tsx
   <div className="bg-blue-500 text-white p-4">Test</div>
   ```

2. **Check in browser**
   - [ ] Element has blue background
   - [ ] Element has white text
   - [ ] Element has padding

3. **Build process works**
   ```bash
   pnpm build
   ```
   - [ ] Build completes without errors
   - [ ] `.next/` folder created
   - [ ] Styles are compiled

---

## 🧪 Test Common Workflows

### Test 1: Use UI Component
```typescript
// In src/app/page.tsx
import { Button } from '@/components/ui/button'

export default function Home() {
  return <Button>Click me</Button>
}
```
- [ ] Button renders in browser
- [ ] Button styling is applied
- [ ] Button is clickable

### Test 2: Use Custom Hook
```typescript
import { useToast } from '@/hooks/use-toast'

export default function Home() {
  const { toast } = useToast()
  return (
    <button onClick={() => toast({ title: 'Hello!' })}>
      Show Toast
    </button>
  )
}
```
- [ ] Button renders
- [ ] Clicking shows toast notification

### Test 3: Use Utility Function
```typescript
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <div className={cn('p-4', 'bg-blue-500')}>
      Styled with utility
    </div>
  )
}
```
- [ ] Div renders with correct styles

---

## 📱 Browser Verification

### Responsive Design
- [ ] Page works on desktop (1920px)
- [ ] Page works on tablet (768px)
- [ ] Page works on mobile (375px)
- [ ] No console warnings or errors
- [ ] No missing images or assets

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

---

## 🔧 Environment Setup

### Environment Variables (Optional)
If you have `.env.local`:
- [ ] File exists in `frontend/.env.local`
- [ ] Variables are loaded correctly
- [ ] No console warnings about missing env vars

### Build Environment
- [ ] `NODE_ENV=development` for dev
- [ ] `NODE_ENV=production` for build
- [ ] Build completes successfully

---

## 📊 Performance Check

### Development Build
```bash
pnpm dev
```
- [ ] Page loads in < 5 seconds
- [ ] Hot reload is fast (< 1 second)
- [ ] No TypeScript errors

### Production Build
```bash
pnpm build
pnpm start
```
- [ ] Build completes successfully
- [ ] `Build output` shows all pages
- [ ] `.next/` folder created
- [ ] Production server starts
- [ ] Page loads and works correctly

---

## 🐛 Debug Checklist

If something isn't working:

### Issue: Can't find `@/` imports
**Check:**
- [ ] tsconfig.json has correct paths
- [ ] Restarted dev server after changes
- [ ] File exists at expected location
- [ ] Using correct import syntax

### Issue: Styles not loading
**Check:**
- [ ] tailwind.config.ts has correct content paths
- [ ] globals.css is imported in layout.tsx
- [ ] CSS file exists in app/ folder
- [ ] Restarted dev server

### Issue: Module not found
**Check:**
- [ ] File exists at specified path
- [ ] File extension is included (.tsx, .ts, etc.)
- [ ] Path is relative to src/ folder
- [ ] No typos in path

### Issue: Port already in use
**Solution:**
```bash
# Use different port
pnpm dev -- -p 3001
```

### Issue: Node modules corrupted
**Solution:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## ✅ Final Verification

### Before Deployment

1. **Run all checks above**: ✅
2. **Test all features work**: ✅
3. **Build for production**:
   ```bash
   pnpm build
   ```
   - [ ] No errors
   - [ ] Build size is reasonable

4. **Test production build**:
   ```bash
   pnpm start
   ```
   - [ ] Page loads
   - [ ] All features work

5. **Code quality**:
   ```bash
   pnpm lint
   ```
   - [ ] No linting errors (warnings okay)

---

## 🎯 Success Criteria

You're all set if:

✅ Dev server runs without errors  
✅ Page loads at http://localhost:3000  
✅ All imports work with `@/` paths  
✅ Styles load correctly  
✅ Components render properly  
✅ Hot reload works  
✅ Production build succeeds  
✅ No TypeScript errors  
✅ All tests pass  

---

## 🚀 Ready to Deploy?

If all checkboxes are checked:

1. **Commit to git**
   ```bash
   git add .
   git commit -m "feat: reorganize project structure"
   ```

2. **Push to repository**
   ```bash
   git push origin main
   ```

3. **Deploy**
   - Deploy the `frontend/` folder to your hosting

---

## 📞 Still Having Issues?

1. **Check documentation**: `README.md`
2. **Review structure**: `FOLDER_STRUCTURE.md`
3. **Debug steps**: See "Debug Checklist" above
4. **Ask for help**: Share the error message

---

## 📅 Verification Date

- Date Checked: _______________
- By: _______________
- Status: ✅ / ❌

---

**Document Version**: 1.0.0  
**Last Updated**: February 2026
