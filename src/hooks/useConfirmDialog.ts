import { useState, useCallback } from 'react';
import { ConfirmDialogState } from '../types';

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'danger',
    onConfirm: () => {},
    onCancel: () => {},
    isProcessing: false,
  });

  const openConfirmDialog = useCallback(
    ({
      title,
      message,
      confirmLabel = 'Delete',
      cancelLabel = 'Cancel',
      variant = 'danger',
      onConfirm,
      onCancel,
    }: {
      title: string;
      message: string;
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: 'danger' | 'warning' | 'primary';
      onConfirm: () => void | Promise<void>;
      onCancel?: () => void;
    }) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        confirmLabel,
        cancelLabel,
        variant,
        onConfirm,
        onCancel,
        isProcessing: false,
      });
    },
    []
  );

  const closeConfirmDialog = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      isOpen: false,
      isProcessing: false,
    }));
  }, []);

  const handleConfirm = useCallback(async () => {
    try {
      setDialogState((prev) => ({ ...prev, isProcessing: true }));
      await dialogState.onConfirm();
    } finally {
      closeConfirmDialog();
    }
  }, [dialogState, closeConfirmDialog]);

  const handleCancel = useCallback(() => {
    if (dialogState.onCancel) {
      dialogState.onCancel();
    }
    closeConfirmDialog();
  }, [dialogState, closeConfirmDialog]);

  return {
    confirmDialogProps: {
      isOpen: dialogState.isOpen,
      title: dialogState.title,
      message: dialogState.message,
      confirmLabel: dialogState.confirmLabel,
      cancelLabel: dialogState.cancelLabel,
      variant: dialogState.variant,
      isProcessing: dialogState.isProcessing,
      onConfirm: handleConfirm,
      onClose: handleCancel,
    },
    openConfirmDialog,
    closeConfirmDialog,
  };
}
