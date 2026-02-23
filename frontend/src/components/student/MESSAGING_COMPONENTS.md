# Messaging System Components Reference

## Component Hierarchy

```
Messages (Main Hub)
├── ConversationList
│   ├── Search Bar
│   └── Conversation Items
│       ├── Avatar
│       ├── User Info
│       ├── Last Message Preview
│       └── Unread Badge
├── MessageThread
│   ├── Thread Header
│   │   ├── Recipient Avatar
│   │   ├── Recipient Name & Role
│   │   └── Message Count
│   └── Messages List
│       └── MessageCard (multiple)
│           ├── Avatar
│           ├── Sender Info
│           ├── Status Badge
│           ├── Content Bubble
│           ├── Timestamp
│           └── Actions (Delete, Copy)
└── MessageInput
    ├── Subject Field (optional)
    ├── Content Textarea
    ├── Character Counter
    ├── Error Messages
    └── Send Button

StatusBadge (Reusable)
└── Status Icon + Optional Label
```

---

## Component Props & Usage

### Messages (Main Hub)

```typescript
interface MessagesProps {
  currentUserId: string;
}

<Messages currentUserId={studentId} />
```

**Features:**
- Manages conversation list and selection
- Handles message fetching and sending
- Auto-polls every 30 seconds
- Responsive desktop/mobile layout

---

### ConversationList

```typescript
interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId?: string;
  onSelectConversation: (userId: string) => void;
  loading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filterStatus?: 'all' | 'unread' | 'read';
}

<ConversationList
  conversations={conversations}
  selectedUserId={selectedUserId}
  onSelectConversation={handleSelect}
  loading={loading}
  filterStatus={filterStatus}
/>
```

**Features:**
- Search with real-time filtering
- Status badges (unread count)
- Sorted by most recent
- Loading skeleton states
- Empty state messaging

---

### MessageThread

```typescript
interface MessageThreadProps {
  recipientName: string;
  recipientRole?: string;
  recipientAvatar?: string;
  messages: Message[];
  currentUserId: string;
  loading?: boolean;
  onBack?: () => void;
  onDeleteMessage?: (messageId: string) => void;
  onMarkAsRead?: (messageId: string) => void;
  showBackButton?: boolean;
}

<MessageThread
  recipientName="Admin"
  recipientRole="Lost & Found Officer"
  messages={threadMessages}
  currentUserId={currentUserId}
  loading={threadLoading}
  onDeleteMessage={handleDelete}
  onMarkAsRead={handleMarkAsRead}
  showBackButton={true}
/>
```

**Features:**
- Auto-scroll to new messages
- Responsive header
- Loading skeleton states
- Empty state messaging
- Message list with proper ordering

---

### MessageCard

```typescript
interface MessageCardProps {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  content: string;
  subject?: string;
  timestamp: string | Date;
  status: 'unread' | 'read' | 'replied';
  isOwn: boolean;
  onDelete?: (messageId: string) => void;
  onMarkAsRead?: (messageId: string) => void;
}

<MessageCard
  id="msg-1"
  sender={senderInfo}
  content="Message content here"
  timestamp={new Date()}
  status="unread"
  isOwn={false}
  onDelete={handleDelete}
  onMarkAsRead={handleMarkAsRead}
/>
```

**Features:**
- Differentiated styling for own vs received
- Avatar with fallback initials
- Sender role badge
- Status indicator
- Delete action (own messages only)
- Copy message action
- Relative timestamp formatting
- Hover effect animations

---

### MessageInput

```typescript
interface MessageInputProps {
  onSendMessage: (content: string, subject?: string) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
  showSubject?: boolean;
}

<MessageInput
  onSendMessage={handleSendMessage}
  loading={sending}
  placeholder="Type your message..."
  showSubject={false}
/>
```

**Features:**
- Auto-growing textarea
- Character counter (5000 max)
- Real-time validation
- Subject field (optional)
- Keyboard shortcuts (Ctrl+Enter)
- Loading state feedback
- Error message display
- Visual feedback on character limits

---

### StatusBadge

```typescript
interface StatusBadgeProps {
  status: 'unread' | 'read' | 'replied';
  className?: string;
  showLabel?: boolean;
}

<StatusBadge status="unread" showLabel={true} />
```

**Features:**
- Three status types with unique colors
- Color-coded icons
- Optional label display
- Accessible ARIA labels
- Lightweight and reusable

---

## Styling Classes

### Message Bubbles

**Own Messages (User Sent):**
```css
bg-gradient-to-br from-blue-600 to-cyan-600
text-white
ml-auto (right alignment)
rounded-br-none (bottom-right corner sharp)
shadow-md hover:shadow-lg
```

**Received Messages (Admin):**
```css
bg-white
border border-gray-200
text-gray-900
rounded-bl-none (bottom-left corner sharp)
hover:shadow-md
```

---

## Color Scheme

### Status Colors
- **Unread**: `#3B82F6` (Blue-500)
- **Read**: `#10B981` (Emerald-500)
- **Replied**: `#8B5CF6` (Purple-500)

### Background Colors
- **Primary**: White
- **Secondary**: `#F9FAFB` (Gray-50)
- **Accent**: `#F3F4F6` (Gray-100)
- **Dark**: `#111827` (Gray-900)

### Text Colors
- **Primary**: `#111827` (Gray-900)
- **Secondary**: `#4B5563` (Gray-600)
- **Tertiary**: `#9CA3AF` (Gray-500)

---

## Animation & Transitions

### Message Entrance
```css
animate: opacity: 0 → 1, y: 20 → 0
duration: 0.3s
easing: easeOut
```

### Hover Effects
```css
transition: all 0.2s ease
box-shadow: shadow-sm → shadow-md
```

### Input Focus
```css
border-color: gray → blue
ring: 2px ring-blue-500/20
background: gray-50 → white
```

---

## Responsive Breakpoints

### Desktop (>1024px)
- 3-column layout (1/4 sidebar + 3/4 messages)
- Side-by-side conversation and thread
- Full conversation list visible

### Tablet (768px-1024px)
- 2-column layout with possible sidebar collapse
- Touch-optimized interaction areas

### Mobile (<768px)
- Single column view
- Bottom sheet conversation list
- Full-screen message thread
- Back button for navigation

---

## Loading States

### Skeleton Loaders
```
Conversation List: 3 animated placeholder boxes
Message Thread: Header + 3 message placeholders
Input: Disabled state with reduced opacity
```

### Empty States
```
No Conversations: Icon + "No conversations yet" message
No Messages: Icon + "Select a conversation" message
No Results: Icon + "No conversations found" (search)
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Enter (Cmd+Enter on Mac) | Send message |
| Escape | Close mobile conversation list |
| Up/Down | Navigate conversations (future) |

---

## Accessibility Features

- Semantic HTML elements
- ARIA labels for icons
- Screen reader text for actions
- Keyboard navigation support
- Color contrast compliance
- Focus indicators on interactive elements
- Alt text for avatars

---

## Best Practices

1. **Always show loading states** during API calls
2. **Validate input** before sending messages
3. **Handle errors gracefully** with user-friendly messages
4. **Auto-refresh** conversations every 30 seconds
5. **Preserve scroll position** when not receiving new messages
6. **Use relative timestamps** for better UX
7. **Debounce search** input for performance
8. **Sanitize user content** before displaying

---

## Integration Example

```tsx
'use client';

import { useState, useEffect } from 'react';
import Messages from '@/components/student/messages';

export default function MessagesPage() {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get current user ID from session or context
    const token = localStorage.getItem('access_token');
    if (token) {
      // Fetch user ID from profile
      setUserId('user-123');
    }
  }, []);

  return (
    <div className="h-screen">
      <Messages currentUserId={userId} />
    </div>
  );
}
```

---

## Testing Guidelines

### Unit Tests
- Component rendering
- Props validation
- Event handlers
- State management

### Integration Tests
- Message send/receive flow
- Conversation selection
- API integration
- Error handling

### E2E Tests
- Full messaging workflow
- Responsive design
- Cross-browser compatibility
- Performance benchmarks

---

## Common Issues & Solutions

### Issue: Messages not updating
**Solution:** Check API endpoint, ensure polling interval, verify authentication

### Issue: Responsive layout broken
**Solution:** Verify breakpoints, check viewport meta tag, test with actual devices

### Issue: Slow message rendering
**Solution:** Check message count, implement pagination, optimize re-renders

### Issue: Keyboard shortcuts not working
**Solution:** Verify event listeners, check for input focus conflicts

---

## Performance Tips

1. Implement pagination for large message lists
2. Use React.memo for MessageCard components
3. Debounce search input
4. Lazy load conversation list
5. Memoize computed values with useMemo
6. Use useCallback for event handlers
7. Monitor polling frequency
8. Compress avatars and media

---
