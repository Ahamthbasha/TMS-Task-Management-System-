// src/components/common/ConfirmationDialog.tsx

import React from 'react';
import './ConfirmationDialog.css';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-content">
          <div className={`dialog-icon ${type}`}>
            {type === 'danger' && '⚠️'}
            {type === 'warning' && '⚠️'}
            {type === 'info' && 'ℹ️'}
          </div>
          <h3 className="dialog-title">{title}</h3>
          <p className="dialog-message">{message}</p>
          <div className="dialog-actions">
            <button
              onClick={onClose}
              className="dialog-btn dialog-btn-cancel"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`dialog-btn dialog-btn-confirm ${type}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;