/**
 * @fileoverview Reusable modal icon component with gradient background and outlined circle
 * @module components/ModalIcon
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import './ModalIcon.css';

interface ModalIconProps {
  icon: LucideIcon;
  iconSize?: number;
  iconStrokeWidth?: number;
}

/**
 * @description Modal icon component with blue gradient square, white circle outline, and centered icon
 * @param {ModalIconProps} props - Component props
 * @param {LucideIcon} props.icon - Lucide icon component to display
 * @param {number} [props.iconSize=24] - Size of the icon in pixels
 * @param {number} [props.iconStrokeWidth=2.5] - Stroke width of the icon
 * @returns {React.ReactElement} Modal icon component
 */
export const ModalIcon: React.FC<ModalIconProps> = ({
  icon: Icon,
  iconSize = 24,
  iconStrokeWidth = 2.5,
}) => {
  return (
    <div className="modal-icon">
      <div className="modal-icon__circle" />
      <Icon size={iconSize} strokeWidth={iconStrokeWidth} className="modal-icon__svg" />
    </div>
  );
};
