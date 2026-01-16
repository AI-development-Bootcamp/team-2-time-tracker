# UI Components

Shared UI component library for the Time Tracker frontend applications.

## Overview

The `@client/ui` package provides reusable React components built with:
- Radix UI primitives for accessibility
- BEM CSS naming convention
- RTL (Right-to-Left) support for Hebrew
- react-hook-form + Zod integration

## Components

### Button

A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@client/ui';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Show loading spinner |
| `fullWidth` | `boolean` | `false` | Stretch to full width |
| `disabled` | `boolean` | `false` | Disable button |
| `children` | `ReactNode` | - | Button content |

#### Examples

```tsx
// Primary button
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>

// Loading state
<Button isLoading>
  Saving...
</Button>

// Danger button
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

// Full width
<Button fullWidth size="lg">
  Submit Form
</Button>
```

---

### Input

A form input component with label, error handling, and RTL support.

```tsx
import { Input } from '@client/ui';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Input label |
| `error` | `string` | - | Error message |
| `helperText` | `string` | - | Helper text below input |
| `isRequired` | `boolean` | `false` | Show required asterisk |
| `fullWidth` | `boolean` | `false` | Stretch to full width |

#### Examples

```tsx
// Basic input
<Input
  label="Email"
  type="email"
  placeholder="user@example.com"
/>

// With error
<Input
  label="Password"
  type="password"
  error="Password is required"
  isRequired
/>

// With helper text
<Input
  label="Username"
  helperText="Only letters and numbers"
/>

// With react-hook-form
<Input
  label="Email"
  {...register('email')}
  error={errors.email?.message}
/>
```

---

### Dialog

A modal dialog component built with Radix Dialog.

```tsx
import { Dialog } from '@client/ui';
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Control open state |
| `onOpenChange` | `(open: boolean) => void` | Callback when state changes |
| `title` | `string` | Dialog title |
| `description` | `string` | Optional description |
| `children` | `ReactNode` | Dialog content |

#### Examples

```tsx
function ConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
      
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Action"
        description="Are you sure you want to proceed?"
      >
        <div className="dialog-actions">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </Dialog>
    </>
  );
}
```

---

### Toast / useToast

A notification system built with Radix Toast.

```tsx
import { ToastProvider, useToast } from '@client/ui';
```

#### Setup

Wrap your app with `ToastProvider`:

```tsx
function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}
```

#### Hook Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `toast` | `{ title, description?, variant }` | Show generic toast |
| `success` | `(title, description?)` | Show success toast |
| `error` | `(title, description?)` | Show error toast |
| `warning` | `(title, description?)` | Show warning toast |
| `info` | `(title, description?)` | Show info toast |

#### Examples

```tsx
function SaveButton() {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Saved!', 'Your changes have been saved.');
    } catch (error) {
      toast.error('Error', 'Failed to save changes.');
    }
  };

  return <Button onClick={handleSave}>Save</Button>;
}
```

---

### Form Components

Form wrapper components for react-hook-form integration.

```tsx
import { Form, FormField, FormActions, FormSubmitButton } from '@client/ui';
```

#### Form

| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `(e: FormEvent) => void` | Form submit handler |
| `children` | `ReactNode` | Form content |

#### FormField

Wrapper around `Input` with form styling.

#### FormActions

Container for form buttons with alignment options.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'end'` | Button alignment |

#### FormSubmitButton

Submit button with automatic loading state.

| Prop | Type | Description |
|------|------|-------------|
| `isSubmitting` | `boolean` | Show loading state |

#### Examples

```tsx
function MyForm() {
  const { register, handleSubmit, formState } = useForm();

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Email"
        {...register('email')}
        error={formState.errors.email?.message}
        isRequired
      />
      <FormField
        label="Password"
        type="password"
        {...register('password')}
        error={formState.errors.password?.message}
        isRequired
      />
      <FormActions align="stretch">
        <FormSubmitButton isSubmitting={formState.isSubmitting}>
          Submit
        </FormSubmitButton>
      </FormActions>
    </Form>
  );
}
```

---

### LoginForm

Pre-built login form with validation.

```tsx
import { LoginForm } from '@client/ui';
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `(data: LoginFormData) => Promise<void>` | Submit handler |
| `isLoading` | `boolean` | Loading state |
| `error` | `string` | Error message |

#### LoginFormData

```typescript
interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

#### Example

```tsx
function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await authApi.login(data);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

---

### PasswordChangeForm

Pre-built password change form with validation.

```tsx
import { PasswordChangeForm } from '@client/ui';
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `(data: PasswordChangeFormData) => Promise<void>` | Submit handler |
| `onCancel` | `() => void` | Cancel handler |
| `isLoading` | `boolean` | Loading state |
| `error` | `string` | Error message |
| `success` | `string` | Success message |

#### PasswordChangeFormData

```typescript
interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

#### Validation Rules

- Current password: Required
- New password: Min 8 chars, uppercase, lowercase, number
- Confirm password: Must match new password

#### Example

```tsx
function SettingsPage() {
  const [status, setStatus] = useState({ error: '', success: '' });

  const handleChangePassword = async (data: PasswordChangeFormData) => {
    try {
      await authApi.changePassword(data);
      setStatus({ error: '', success: 'Password changed successfully' });
    } catch (err) {
      setStatus({ error: 'Current password is incorrect', success: '' });
    }
  };

  return (
    <PasswordChangeForm
      onSubmit={handleChangePassword}
      onCancel={() => navigate(-1)}
      error={status.error}
      success={status.success}
    />
  );
}
```

## CSS Design Tokens

Import tokens for consistent styling:

```css
@import '@client/ui/styles/tokens.css';
```

### Available Tokens

#### Colors
- `--color-primary-*` (50-900)
- `--color-success`, `--color-error`, `--color-warning`, `--color-info`
- `--color-gray-*` (50-900)
- `--color-background`, `--color-text-primary`, `--color-border`

#### Spacing
- `--spacing-xs` (4px)
- `--spacing-sm` (8px)
- `--spacing-md` (16px)
- `--spacing-lg` (24px)
- `--spacing-xl` (32px)

#### Typography
- `--font-size-xs` to `--font-size-3xl`
- `--font-weight-normal`, `--font-weight-medium`, `--font-weight-bold`

#### Other
- `--radius-sm`, `--radius-md`, `--radius-lg`
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- `--transition-fast`, `--transition-normal`

## RTL Support

All components support RTL layouts. Set `dir="rtl"` on your root element:

```html
<html lang="he" dir="rtl">
```

Components use CSS logical properties (`margin-inline-start`, `padding-inline-end`, etc.) for automatic RTL support.
