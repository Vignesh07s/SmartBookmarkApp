"use client";

import { TriangleAlert, AlertCircle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      {/* Modal Container */}
      <div 
        className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header: Icon and Title on one line */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
            <TriangleAlert className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Delete Bookmark?
          </h3>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <p className="text-slate-600 leading-relaxed text-lg">
            Do you want to delete <span className="font-bold text-slate-900">{title}</span>?
          </p>
          
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 font-medium leading-snug">
              This action is permanent and cannot be undone.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 px-4 rounded-2xl font-bold bg-green-500 text-black hover:bg-green-600 transition-all border border-transparent hover:border-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 px-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 hover:shadow-red-300 transition-all active:scale-[0.98]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}