"use client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({ open, onClose, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Agent?</DialogTitle>
        </DialogHeader>

        <div className="py-2 text-gray-700 text-sm space-y-1">
          <p>
            Deleting this agent will permanently remove:
          </p>
          <ul className="list-disc list-inside text-gray-600">
            <li>Wallet + all wallet transactions</li>
            <li>All bids</li>
            <li>Login sessions</li>
            <li>Personal data</li>
          </ul>
          <p className="mt-2 font-medium text-red-500">
            This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className=" cursor-pointer">
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
