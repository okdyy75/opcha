# Frontend Components Guide

## Overview

This guide provides detailed information about all React components in the Opcha chat application, including implementation details, styling conventions, and usage patterns.

## Component Architecture

### Design System

The application uses CSS custom properties for theming and consistent styling:

```css
/* Color Variables */
--color-primary-500: Primary brand color
--color-primary-600: Darker primary for hover states
--color-bg-primary: Main background color
--color-bg-secondary: Secondary background color
--color-text-primary: Main text color
--color-text-secondary: Secondary text color
--color-border-primary: Border color
```

### Component Structure

All components follow these conventions:
- TypeScript interfaces for props
- Proper accessibility attributes
- Responsive design
- Error handling
- Loading states where applicable

---

## Core Components

### Modal Component

**File:** `frontend/src/components/Modal.tsx`

**Purpose:** Provides a reusable modal overlay for dialogs and forms.

**Features:**
- Backdrop click to close
- Escape key handling
- Focus management
- Accessibility support
- Optional close button
- Custom title support

**Props Interface:**
```typescript
interface ModalProps {
  isOpen: boolean;           // Controls modal visibility
  onClose: () => void;       // Callback when modal should close
  title?: string;            // Optional modal title
  showCloseButton?: boolean; // Show/hide close button
  children: React.ReactNode; // Modal content
}
```

**Implementation Details:**
```jsx
// Basic usage
<Modal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)} 
  title="Modal Title"
  showCloseButton={true}
>
  <div>Your content here</div>
</Modal>

// Without close button (force user interaction)
<Modal 
  isOpen={isConfirmModalOpen} 
  onClose={() => {}} 
  title="Confirm Action"
  showCloseButton={false}
>
  <div>Are you sure?</div>
  <button onClick={handleConfirm}>Yes</button>
  <button onClick={() => setIsConfirmModalOpen(false)}>No</button>
</Modal>
```

**Accessibility Features:**
- `role="dialog"`
- `aria-labelledby` for title
- `aria-modal="true"`
- Focus trap within modal
- Escape key support

---

### CreateRoomModal Component

**File:** `frontend/src/components/CreateRoomModal.tsx`

**Purpose:** Specialized modal for creating new chat rooms.

**Features:**
- Real-time validation
- Character count display
- Enter key submission
- Loading state management
- Auto-focus on input
- Form reset on success

**Props Interface:**
```typescript
interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomName: string) => Promise<void>;
  isCreating?: boolean;
}
```

**Validation Rules:**
- Room name is required
- Maximum 50 characters
- Trims whitespace
- Prevents submission during creation

**Usage Example:**
```jsx
const [isCreating, setIsCreating] = useState(false);

<CreateRoomModal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onCreateRoom={async (name) => {
    setIsCreating(true);
    try {
      const result = await apiClient.createRoom({ name });
      if (result.data) {
        router.push(`/rooms/${result.data.room.share_token}`);
        setShowCreateModal(false);
      } else {
        showToast(result.error?.message || 'Failed to create room', 'error');
      }
    } finally {
      setIsCreating(false);
    }
  }}
  isCreating={isCreating}
/>
```

**Error Handling:**
- Displays validation errors inline
- Handles API errors through parent component
- Graceful degradation on network issues

---

### NicknameModal Component

**File:** `frontend/src/components/NicknameModal.tsx`

**Purpose:** Modal for setting and updating user nicknames with random generation.

**Features:**
- Real-time validation
- Random nickname generation
- Character limit enforcement
- Error display
- Enter key submission
- Dice button for randomization

**Props Interface:**
```typescript
interface NicknameModalProps {
  isOpen: boolean;
  currentNickname: string;
  onClose: () => void;
  onUpdate: (nickname: string) => boolean | Promise<boolean>;
}
```

**Validation Rules:**
- Maximum 20 characters (frontend limit)
- Cannot be empty
- Trims whitespace
- Real-time error clearing

**Usage Example:**
```jsx
const { nickname, updateNickname } = useSession();
const [showNicknameModal, setShowNicknameModal] = useState(false);

<NicknameModal
  isOpen={showNicknameModal}
  currentNickname={nickname}
  onClose={() => setShowNicknameModal(false)}
  onUpdate={async (newNickname) => {
    const success = await updateNickname(newNickname);
    if (success) {
      showToast('Nickname updated successfully!', 'success');
      return true;
    } else {
      showToast('Failed to update nickname', 'error');
      return false;
    }
  }}
/>
```

**Random Generation:**
- Uses dice emoji button (🎲)
- Generates Japanese-style nicknames
- Immediately updates input field
- Clears any existing errors

---

### ShareButton Component

**File:** `frontend/src/components/ShareButton.tsx`

**Purpose:** Button for sharing room URLs with Web Share API fallback.

**Features:**
- Native Web Share API detection
- Clipboard fallback for unsupported browsers
- Toast notifications for feedback
- Mobile-optimized sharing
- Proper error handling

**Props Interface:**
```typescript
interface ShareButtonProps {
  shareUrl: string;  // Full URL to share
  roomName: string;  // Room name for share text
}
```

**Implementation Strategy:**
1. Check for Web Share API support
2. Use native sharing if available
3. Fall back to clipboard copy
4. Provide user feedback via toasts

**Usage Example:**
```jsx
<ShareButton
  shareUrl={`${window.location.origin}/rooms/${room.share_token}`}
  roomName={room.name}
/>
```

**Browser Compatibility:**
- Web Share API: Modern mobile browsers
- Clipboard API: Most modern browsers
- Graceful degradation for older browsers

---

### Toast Component

**File:** `frontend/src/components/Toast.tsx`

**Purpose:** Displays temporary notification messages.

**Features:**
- Multiple toast types (success, error, info)
- Auto-dismiss with configurable duration
- Manual dismissal
- Stacking support
- Smooth animations
- Accessibility support

**Props Interface:**
```typescript
interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
```

**Toast Types:**
- **Success**: Green background, checkmark icon
- **Error**: Red background, error icon
- **Info**: Blue background, info icon

**Usage with useToast Hook:**
```jsx
function MyComponent() {
  const { toasts, success, error, info, removeToast } = useToast();

  const handleSuccess = () => {
    success('Operation completed!', 3000);
  };

  const handleError = () => {
    error('Something went wrong!', 5000);
  };

  return (
    <>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
```

**Animation Details:**
- Slide in from top
- Fade out on dismiss
- Smooth transitions
- Proper z-index stacking

---

## Page Components

### Home Page

**File:** `frontend/src/app/page.tsx`

**Purpose:** Main landing page with room list and creation functionality.

**Features:**
- Room list display
- Infinite scroll pagination
- Room creation modal
- Nickname management
- Share functionality
- Responsive design

**Key Functionality:**
- Fetches and displays paginated room list
- Handles room creation flow
- Manages session state
- Provides navigation to individual rooms

### Room Page

**File:** `frontend/src/app/rooms/[id]/page.tsx`

**Purpose:** Individual chat room interface.

**Features:**
- Real-time message display
- Message composition
- Room information display
- Share functionality
- Auto-scroll to latest messages
- Message pagination

**Key Functionality:**
- Fetches room details and messages
- Handles message sending
- Manages real-time updates
- Provides room sharing

---

## Styling Guidelines

### CSS Custom Properties

Use CSS custom properties for consistent theming:

```css
.component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

.component:hover {
  background-color: var(--color-bg-secondary);
}
```

### Responsive Design

Follow mobile-first approach:

```css
/* Mobile first */
.component {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: 2rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: 3rem;
  }
}
```

### Button Styles

Consistent button styling patterns:

```css
.button-primary {
  background-color: var(--color-primary-500);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.button-primary:hover {
  background-color: var(--color-primary-600);
}

.button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Accessibility Guidelines

### ARIA Attributes

Always include appropriate ARIA attributes:

```jsx
// Modal
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Modal Title</h2>
</div>

// Form inputs
<label htmlFor="room-name">Room Name</label>
<input 
  id="room-name" 
  aria-describedby="room-name-help"
  aria-invalid={hasError}
/>
<p id="room-name-help">Enter a room name (max 50 characters)</p>

// Error messages
<p role="alert" className="error-message">
  This field is required
</p>
```

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```jsx
// Keyboard event handling
<input
  onKeyPress={(e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }}
/>

// Focus management
useEffect(() => {
  if (isOpen && inputRef.current) {
    inputRef.current.focus();
  }
}, [isOpen]);
```

### Screen Reader Support

Provide meaningful text for screen readers:

```jsx
// Hidden text for context
<span className="sr-only">Share room: {roomName}</span>

// Descriptive button labels
<button aria-label="Generate random nickname">
  🎲
</button>

// Loading states
<button disabled={isLoading}>
  {isLoading ? 'Creating...' : 'Create Room'}
</button>
```

---

## Performance Considerations

### Component Optimization

Use React optimization techniques:

```jsx
// Memoize expensive calculations
const sortedRooms = useMemo(() => {
  return rooms.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}, [rooms]);

// Memoize callback functions
const handleRoomCreate = useCallback(async (name) => {
  // Implementation
}, []);

// Memoize components when appropriate
const MemoizedRoomItem = memo(RoomItem);
```

### Bundle Size

Keep component dependencies minimal:

```jsx
// Import only what you need
import { useState, useEffect, useCallback } from 'react';

// Avoid large utility libraries for simple operations
const formatDate = (date) => {
  return new Intl.DateTimeFormat('ja-JP').format(new Date(date));
};
```

---

## Testing Guidelines

### Component Testing

Test components with React Testing Library:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import CreateRoomModal from './CreateRoomModal';

test('creates room when form is submitted', async () => {
  const mockCreateRoom = jest.fn();
  
  render(
    <CreateRoomModal
      isOpen={true}
      onClose={() => {}}
      onCreateRoom={mockCreateRoom}
    />
  );

  const input = screen.getByLabelText(/room name/i);
  const submitButton = screen.getByRole('button', { name: /create/i });

  fireEvent.change(input, { target: { value: 'Test Room' } });
  fireEvent.click(submitButton);

  expect(mockCreateRoom).toHaveBeenCalledWith('Test Room');
});
```

### Accessibility Testing

Include accessibility tests:

```jsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('modal has no accessibility violations', async () => {
  const { container } = render(
    <Modal isOpen={true} onClose={() => {}}>
      <p>Test content</p>
    </Modal>
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Common Patterns

### Error Boundaries

Wrap components in error boundaries for better error handling:

```jsx
class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}
```

### Loading States

Consistent loading state patterns:

```jsx
function ComponentWithLoading({ isLoading, data }) {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner" aria-label="Loading..." />
        <span className="sr-only">Loading content...</span>
      </div>
    );
  }

  return <div>{/* Render data */}</div>;
}
```

### Form Validation

Reusable validation patterns:

```jsx
const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = values[field];
      
      if (rule.required && !value) {
        newErrors[field] = `${field} is required`;
      } else if (rule.maxLength && value.length > rule.maxLength) {
        newErrors[field] = `${field} must be ${rule.maxLength} characters or less`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  return { values, setValues, errors, validate };
};
```