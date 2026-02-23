# Quick Start Guide

## 🚀 Getting Started in 2 Minutes

### Step 1: Install & Run
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000 in your browser
```

### Step 2: Test the App
1. **Login Page**: You should see the authentication interface
2. **Try Student View**: 
   - Enter any email (e.g., `student@zetech.edu`)
   - Click "Sign In" → Student Dashboard loads
3. **Try Admin View**:
   - Go back (click logout)
   - Click "Admin Portal" tab
   - Enter any credentials
   - Click "Sign In" → Admin Dashboard loads

## 📱 Feature Testing Checklist

### Student Dashboard
- [ ] Search bar filters items by name/location
- [ ] Category chips filter items correctly
- [ ] Click any item card to see details
- [ ] Click "Claim This Item" in modal
- [ ] Fill proof form and submit
- [ ] Notification bell shows in header
- [ ] User avatar displays login name
- [ ] Logout button works

### Admin Dashboard
- [ ] View stats cards on dashboard
- [ ] Click "Add Item" to open form
- [ ] Fill and submit the form
- [ ] View "Inventory" tab with table
- [ ] See action buttons (view/delete)
- [ ] Check "Messages" and "Settings" tabs
- [ ] Logout returns to auth view

## 🎨 Customization Ideas

### Quick Color Change
Edit `/app/globals.css` (lines 12-14):
```css
:root {
  --primary: 215 100% 55%;  /* Change to your brand color */
  --accent: 0 85% 60%;
}
```

### Add More Items
Edit `/lib/dummy-data.ts`:
```typescript
{
  id: '13',
  title: 'Your Item',
  category: 'Electronics',
  description: 'Description here',
  location: 'Location',
  date: '2024-02-11',
  image: 'https://image-url.jpg',
  color: 'Color',
}
```

### Change University Name
Search for "Zetech" in the codebase and replace with your university name:
- `/components/student-header.tsx` (line 19)
- `/components/admin-header.tsx` (line 15)
- `/app/layout.tsx` (line 6)

## 📂 File Structure Quick Reference

```
PROJECT
├── app/
│   ├── page.tsx              ← Main app logic (view switching)
│   ├── layout.tsx            ← HTML structure & metadata
│   └── globals.css           ← All colors & animations
│
├── components/               ← React components
│   ├── auth-view.tsx         ← Login/signup form
│   ├── student-dashboard.tsx ← Student main view
│   ├── item-grid.tsx         ← Item cards display
│   ├── item-detail-modal.tsx ← Item popup
│   ├── admin-dashboard.tsx   ← Admin main view
│   └── admin-add-item.tsx    ← Item creation form
│
└── lib/
    └── dummy-data.ts        ← 12 sample items
```

## 🔧 Useful Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Run production build
pnpm lint         # Check code quality

# Format code
pnpm format       # Auto-format files
```

## 🎯 What You Can Do Right Now

### ✅ Works Perfectly
- ✅ Login with any credentials
- ✅ Search & filter items
- ✅ View item details
- ✅ Claim items with proof form
- ✅ Add items in admin panel
- ✅ View inventory table
- ✅ Responsive on mobile/tablet/desktop
- ✅ Smooth glassmorphism animations

### ⚠️ Demo Only (Not Connected)
- ⚠️ Forms don't save to database
- ⚠️ No email notifications
- ⚠️ No file upload (drag/drop shown but not saved)
- ⚠️ No user authentication (any credentials work)
- ⚠️ Admin changes don't persist on refresh

## 🌐 Deployment

### Deploy to Vercel (Recommended)
```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect to Vercel at vercel.com
# 3. Select your repository
# 4. Click "Deploy"
# 5. Your app goes live instantly
```

### Deploy to Other Platforms
```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Or use Docker, Netlify, etc.
```

## 🐛 Troubleshooting

### Issue: Animations not smooth
**Solution**: Update your browser to the latest version

### Issue: Images not showing
**Solution**: Check internet connection (images from Unsplash CDN)

### Issue: Form submission not working
**Solution**: It's normal - demo only. Check browser console for logs

### Issue: Styles look off
**Solution**: Clear browser cache (Cmd+Shift+Delete)

## 📚 Learn More

- **Next.js**: https://nextjs.org/docs
- **React Hooks**: https://react.dev/reference/react
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev

## 💡 Pro Tips

1. **Dark Mode**: Browser's dark mode preference respected
2. **Mobile Friendly**: Try on phone - fully responsive
3. **Keyboard Navigation**: Tab through form fields
4. **Search Tips**: Try searching "Electronics" or location names
5. **Admin Tips**: Click multiple category chips to filter
6. **Performance**: Open DevTools → Lighthouse for audit

## 🎉 You're All Set!

The app is ready to use. Explore all features, test on different devices, and enjoy the smooth glassmorphism design!

**Questions?** Check `PROJECT_GUIDE.md` for detailed documentation.

---

**Happy exploring! 🚀**
