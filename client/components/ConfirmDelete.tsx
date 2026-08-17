'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDeleteProps<T> {
  /** The record awaiting confirmation. `null` closes the dialog. */
  target: T | null;
  onCancel: () => void;
  onConfirm: () => void;
  /** What the record is called. Shown in the question. */
  name: (target: T) => string;
  /** Optional second line naming what else goes with it. */
  detail?: (target: T) => string;
  confirmLabel?: string;
}

/**
 * The question always names the record. "Bu kaydı silmek istiyor musunuz?" is
 * unanswerable — the user has to remember which row they clicked, and the row is
 * behind the dialog.
 *
 * `target` stays mounted through the close animation, so the name does not blank
 * out mid-fade; the caller clears it, and the dialog reads whatever it was given
 * until then.
 */
export default function ConfirmDelete<T>({
  target,
  onCancel,
  onConfirm,
  name,
  detail,
  confirmLabel = 'Kalıcı olarak sil',
}: ConfirmDeleteProps<T>) {
  return (
    <AlertDialog open={!!target} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{target && `${name(target)} silinsin mi?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {target && detail
              ? `${detail(target)} Bu işlem geri alınamaz.`
              : 'Kayıt kalıcı olarak kaldırılır. Bu işlem geri alınamaz.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Cancel first and focused by default. The destructive button is never
              the one Enter reaches for. */}
          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
