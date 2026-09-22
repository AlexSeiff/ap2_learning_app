import { createContext, useContext } from 'react';

export interface ConfirmOptions {
  /** Frage bzw. Erklärung im Dialog. */
  message: string;
  title?: string;
  /** Beschriftung des Bestätigen-Buttons (Standard „OK“). */
  confirmLabel?: string;
  /** Beschriftung des Abbrechen-Buttons (Standard „Abbrechen“). */
  cancelLabel?: string;
  /** Rot hervorheben, wenn die Aktion etwas unwiderruflich verwirft oder löscht. */
  danger?: boolean;
}

export type Confirm = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<Confirm | null>(null);

/**
 * Rückfrage vor riskanten Aktionen – Ersatz für window.confirm im Stil der App.
 * `if (!(await confirm({ message: '…' }))) return;` – true nur bei „Bestätigen“, Escape und Abbrechen ergeben false.
 */
export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm() braucht einen <ConfirmProvider> (siehe main.tsx).');
  return confirm;
}
