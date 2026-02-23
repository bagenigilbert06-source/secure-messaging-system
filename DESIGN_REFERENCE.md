# Design Reference & Style Guide

## 🎨 Color System

### Primary Colors
```
Primary (Royal Blue)
  HSL: 215 100% 55%
  RGB: 33, 150, 243
  HEX: #2196F3
  Usage: Buttons, active states, primary CTA
  
Accent (Vibrant Red)
  HSL: 0 85% 60%
  RGB: 242, 82, 82
  HEX: #F25252
  Usage: Alerts, delete actions, warnings
  
Background (Soft Blue)
  HSL: 200 25% 96%
  RGB: 240, 243, 247
  HEX: #F0F3F7
  Usage: Page background, subtle surfaces
```

### Neutral Colors
```
White/Off-white
  HSL: 0 0% 100%
  Usage: Card backgrounds, text areas
  
Light Gray
  HSL: 0 0% 88%
  RGB: 225, 225, 225
  Usage: Borders, dividers, muted elements
  
Dark Gray
  HSL: 210 15% 15%
  RGB: 32, 45, 64
  Usage: Text, foreground, dark elements
```

### Semantic Colors
```
Success (Emerald)
  RGB: 34, 197, 94
  Usage: Confirmed items, success messages
  
Warning (Amber)
  RGB: 217, 119, 6
  Usage: Pending items, warnings
  
Info (Cyan)
  RGB: 6, 182, 212
  Usage: Info messages, secondary actions
```

## 🔤 Typography System

### Font Stack
```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 
    'Segoe UI', sans-serif;
}
```

### Heading Sizes
```
H1: 36px (2.25rem)
    - Page titles
    - Font weight: 700 (bold)
    - Line height: 1.2
    
H2: 30px (1.875rem)
    - Section headings
    - Font weight: 700
    - Line height: 1.3
    
H3: 24px (1.5rem)
    - Component titles
    - Font weight: 600 (semibold)
    - Line height: 1.4
    
H4: 20px (1.25rem)
    - Card titles
    - Font weight: 600
    - Line height: 1.4
```

### Body Text
```
Body (16px / 1rem)
    - Default text
    - Font weight: 400
    - Line height: 1.5
    
Small (14px / 0.875rem)
    - Secondary text
    - Font weight: 400
    - Line height: 1.5
    
Tiny (12px / 0.75rem)
    - Captions, labels
    - Font weight: 500
    - Line height: 1.4
```

## 🎯 Component Specifications

### Buttons

**Primary Button**
```
Background: Hsl(215 100% 55%)
Text: White
Padding: 12px 24px (py-3 px-6)
Border-radius: 50px (rounded-full)
Font-weight: 600 (semibold)
Hover: Opacity 90%
Active: Scale 0.98
Transition: 200ms ease-in-out
```

**Secondary Button**
```
Background: White/10
Text: Foreground
Border: 1px solid white/30
Padding: 12px 24px
Border-radius: 50px
Hover: Background white/20
Transition: 200ms
```

**Icon Button**
```
Size: 40px × 40px
Padding: 8px
Background: Hover only (white/10)
Border-radius: 8px or 50%
Icon size: 20-24px
```

### Input Fields

**Text Input**
```
Background: White/50 with glass effect
Border: 1px solid white/30
Padding: 12px 16px (py-3 px-4)
Border-radius: 16px (rounded-2xl)
Focus: Ring 2px solid primary/50
Font-size: 16px
Transition: 200ms
```

**Select Dropdown**
```
Same as text input
Cursor: pointer
Arrow: Included via browser
Option styling: Enhanced if needed
```

### Cards & Containers

**Glass Card**
```
Background: White/70 with backdrop-blur-xl
Border: 1px solid white/20
Padding: 24px (p-6) or 32px (p-8)
Border-radius: 24px (rounded-2xl)
Shadow: Soft blue shadow (shadow-blue-500/10)
Shadow size: xl (0 20px 25px -5px)
```

**Standard Card**
```
Background: White with opacity
Border: Subtle border
Padding: 16-24px
Border-radius: 16px
Shadow: Light shadow
```

### Modal/Overlay

```
Backdrop: Black/30 with backdrop-blur-sm
Overlay animation: Fade in 200ms
Content animation: Scale from 0.95 to 1
Modal container: Glass effect
Close button: Top-right corner
```

## 🎬 Animation Specifications

### Transitions

**Standard Transition**
```css
transition: all 200ms ease-in-out;
/* or */
transition-duration: 200ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

**Hover Effects**
```
Scale: translate-y-1 or scale-105
Duration: 300ms
Easing: ease-out
Used on: Cards, buttons, interactive elements
```

### Keyframe Animations

**Float Animation** (Background Orbs)
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(30px); }
}

Duration: 6-8s
Timing: ease-in-out
Repeat: infinite
Applied to: .orb elements
```

**Pulse Animation**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

Duration: 2s
Applied to: .orb-1, .orb-2, .orb-3
```

## 📐 Spacing System

### Scale (in pixels)
```
0: 0px
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
7: 28px
8: 32px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
```

### Usage Examples
```
Padding card:  p-6 (24px)
Padding input: p-3 (12px)
Margin bottom: mb-8 (32px)
Gap between items: gap-4 (16px) or gap-6 (24px)
```

## 🔵 Border Radius

```
Small: 8px (rounded-lg minus some)
Medium: 12px (rounded-xl minus some)
Large: 16px (rounded-2xl)
Extra Large: 24px (rounded-3xl)
Full: 50px (rounded-full)
```

## 📏 Responsive Breakpoints

```
Mobile (Default): 320px - 639px
  - Single column
  - Full-width elements
  - Larger touch targets (48px minimum)
  
Tablet (sm): 640px - 767px
  - Two columns for some layouts
  - Increased spacing
  
Desktop (md): 768px - 1023px
  - Two to three columns
  - Sidebar layouts
  
Large (lg): 1024px - 1279px
  - Three columns
  - Maximum content width
  
Extra Large (xl): 1280px+
  - Premium spacing
  - Maximum content width constraint
```

## 🌈 Glassmorphism Details

### Glass Effect Layer
```css
.glass {
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### Depth Levels
```
Level 1 (Glass): bg-white/70, border-white/20
Level 2 (Dark Glass): bg-slate-900/40, border-white/10
Level 3 (Solid): bg-white, border-border
Level 4 (Muted): bg-white/50, border-white/30
```

### Blur Effects
```
Backdrop blur: backdrop-blur-xl (12px)
Image blur: blur-3xl (64px) on orbs
Content blur: None (keeping readability)
```

## 🎨 Color Combinations

### Acceptable Pairs
```
✅ Primary + White text (high contrast)
✅ Primary + Primary-foreground (white)
✅ Accent + White text (high contrast)
✅ Background + Foreground (dark text)
✅ Glass + Foreground text (readable)
```

### Avoid
```
❌ Light gray text on light background
❌ Multiple saturated colors together
❌ Primary + Accent together (competing)
```

## 📱 Touch Targets

```
Minimum size: 44px × 44px (recommended for mobile)
Button: 48px height minimum
Icon button: 40px × 40px minimum
Spacing between touch targets: 8px minimum
```

## ♿ Accessibility Features

### Color Contrast
```
Text on background: 7:1 (AAA level)
Light text on dark: Sufficient
Dark text on light: Sufficient
Icons: Same contrast as text
```

### Focus States
```
focus:ring-2 focus:ring-primary/50
Ring width: 2px
Ring offset: None
Ring color: Primary with reduced opacity
```

### Text Sizing
```
Minimum body text: 14px
Form labels: 14px
Buttons: 14-16px
Headlines: Appropriately sized
```

## 🎭 Component States

### Button States
```
Default: Normal colors
Hover: 90% opacity or slight background change
Active: Scale 98%
Focus: Ring visible
Disabled: Opacity 50%
Loading: Show spinner or text change
```

### Input States
```
Default: White/50 background
Focus: Ring + white/80 background
Error: Red border + error message
Success: Green checkmark + confirmation
Disabled: Opacity 50%, cursor not-allowed
```

### Card States
```
Default: Glass with shadow
Hover: Lift up (translate-y-1) + enhanced shadow
Active/Selected: Ring or border highlight
Loading: Skeleton or shimmer effect
```

## 📚 Typography Hierarchy

```
Level 1: Hero heading (36px) - Page title
         ↓
Level 2: Section heading (30px) - Major sections
         ↓
Level 3: Component heading (24px) - Card titles
         ↓
Level 4: Label (16px) - Form labels
         ↓
Level 5: Body (16px) - Main text content
         ↓
Level 6: Caption (12px) - Helper text, dates
```

## 🖼️ Image Specifications

### Item Card Images
```
Aspect ratio: 4:3
Size: 500×400px (large) to 200×150px (thumbnail)
Format: JPG, PNG, or WebP
Quality: High quality, optimized
Loading: Lazy load if needed
```

### Background Images
```
Full-bleed backgrounds: 1920×1080px minimum
Gradient backgrounds: CSS-generated, no image file
Decorative elements: SVG preferred
```

---

**This design system ensures consistency, accessibility, and visual excellence across the entire application.**
