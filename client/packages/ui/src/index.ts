/**
 * @fileoverview UI Components Library Index
 * @module ui
 */

// Styles
import './styles/tokens.css';

// Components
export { Button } from './components/Button/Button';
export type { ButtonProps } from './components/Button/Button';

export { Input } from './components/Input/Input';
export type { InputProps } from './components/Input/Input';

export { Dialog } from './components/Dialog/Dialog';
export type { DialogProps } from './components/Dialog/Dialog';

export { ToastProvider, useToast } from './components/Toast/Toast';

export {
    Form,
    FormField,
    FormActions,
    FormSubmitButton,
    FormInput,
} from './components/Form/Form';

// Auth Components
export { LoginForm } from './components/LoginForm/LoginForm';
export type { LoginFormProps, LoginFormData } from './components/LoginForm/LoginForm';

export { PasswordChangeForm } from './components/PasswordChangeForm/PasswordChangeForm';
export type { PasswordChangeFormProps, PasswordChangeFormData } from './components/PasswordChangeForm/PasswordChangeForm';

// DatePicker
export { DatePicker } from './components/DatePicker/DatePicker';
export type { DatePickerProps, DateRange } from './components/DatePicker/DatePicker';

// Select
export { Select } from './components/Select/Select';
export type { SelectProps, SelectOption } from './components/Select/Select';

// Tabs
export { Tabs, TabList } from './components/Tabs/Tabs';
export type { TabsProps, TabListProps, Tab } from './components/Tabs/Tabs';

// Sheet (Mobile Modal)
export { Sheet, SheetHeader } from './components/Sheet/Sheet';
export type { SheetProps, SheetHeaderProps } from './components/Sheet/Sheet';

// AbsenceForm
export { AbsenceForm } from './components/AbsenceForm/AbsenceForm';
export type { AbsenceFormProps, AbsenceFormData, AbsenceTypeOption } from './components/AbsenceForm/AbsenceForm';

// DocumentUploader
export { DocumentUploader } from './components/DocumentUploader/DocumentUploader';
export type { DocumentUploaderProps } from './components/DocumentUploader/DocumentUploader';
