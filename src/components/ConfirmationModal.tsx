import React from 'react';

interface ConfirmationModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  open,
  title = 'Confirm Delete',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal-close" aria-label="Close modal" onClick={onCancel}>×</button>
        <div className="modal-title">{title}</div>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="button button-danger" disabled={loading} onClick={onConfirm}>
            {loading ? 'Working...' : confirmText}
          </button>
          <button className="button button-secondary" disabled={loading} onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
