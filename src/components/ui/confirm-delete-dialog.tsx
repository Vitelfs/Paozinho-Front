import  { useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ConfirmDeleteDialogProps } from "@/types/datatable.type";

export function ConfirmDeleteDialog<T>({
  open,
  onOpenChange,
  item,
  itemName,
  onConfirm,
  title = "Confirmar exclusão",
  description,
  confirmText = "Excluir",
  cancelText = "Cancelar",
}: ConfirmDeleteDialogProps<T>) {
  const handleConfirm = useCallback(() => {
    if (item) {
      onConfirm(item);
      onOpenChange(false);
    }
  }, [item, onConfirm, onOpenChange]);

  const defaultDescription = `Tem certeza que deseja excluir ${itemName}? Esta ação não pode ser desfeita.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
