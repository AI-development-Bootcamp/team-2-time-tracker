/**
 * @fileoverview Reusable form action button with icon
 * @module components/FormActionButton
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import './FormActionButton.css';

interface FormActionButtonProps {
  label: string;
  loadingLabel?: string;
  icon: LucideIcon;
  disabled?: boolean;
  isLoading?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
}

/**
 * @description Form action button with text and circular icon on the right
 * @param {FormActionButtonProps} props - Component props
 * @returns {React.ReactElement} Form action button component
 */
export const FormActionButton: React.FC<FormActionButtonProps> = ({
  label,
  loadingLabel,
  icon: Icon,
  disabled = false,
  isLoading = false,
  type = 'submit',
  onClick,
}) => {
  return (
    <button
      type={type}
      className="form-action-button"
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      onClick={onClick}
    >
      <span>{isLoading && loadingLabel ? loadingLabel : label}</span>
      <div className="form-action-button__icon">
        <div className="form-action-button__icon-circle" />
        <Icon size={16} strokeWidth={2.5} />
      </div>
    </button>
  );
};
