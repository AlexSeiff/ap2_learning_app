import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import { ConfirmContext, type Confirm, type ConfirmOptions } from '../hooks/useConfirm';

type Pending = ConfirmOptions & { id: number; resolve: (ok: boolean) => void };

/** Stellt useConfirm() bereit und zeigt immer höchstens einen Bestätigungsdialog. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);
  const counter = useRef(0);

  const confirm = useCallback<Confirm>(
    (options) =>
      new Promise<boolean>((resolve) => {
        // Eine noch offene Rückfrage gilt als abgebrochen.
        pendingRef.current?.resolve(false);
        const next = { ...options, id: ++counter.current, resolve };
        pendingRef.current = next;
        setPending(next);
      }),
    [],
  );

  const close = useCallback((ok: boolean) => {
    const current = pendingRef.current;
    pendingRef.current = null;
    setPending(null);
    current?.resolve(ok);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && <ConfirmDialog key={pending.id} options={pending} onClose={close} />}
    </ConfirmContext.Provider>
  );
}

/** Modaler Dialog (natives <dialog> mit showModal: Fokus bleibt im Dialog, Escape bricht ab). */
function ConfirmDialog({ options, onClose }: { options: ConfirmOptions; onClose: (ok: boolean) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Fokus zurück auf das auslösende Element, wenn der Dialog schließt.
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    // Abbrechen vorauswählen: ein versehentliches Enter verwirft nichts.
    cancelRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
      previous?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(e) => {
        // Escape: selbst schließen, damit der Zustand in React stimmt.
        e.preventDefault();
        onClose(false);
      }}
      onClick={(e) => {
        // Klick auf den abgedunkelten Hintergrund (außerhalb des Inhalts) bricht ab.
        if (e.target === e.currentTarget) onClose(false);
      }}
    >
      <div className="confirm-body">
        <h2 id={titleId}>{options.title ?? (options.danger ? '⚠️ Bist du sicher?' : 'Bitte bestätigen')}</h2>
        <p id={messageId}>{options.message}</p>
        <div className="actions">
          <button type="button" className={options.danger ? 'low' : ''} onClick={() => onClose(true)}>
            {options.confirmLabel ?? 'OK'}
          </button>
          <button type="button" ref={cancelRef} className="secondary" onClick={() => onClose(false)}>
            {options.cancelLabel ?? 'Abbrechen'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
