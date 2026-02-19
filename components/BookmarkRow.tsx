"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Bookmark {
  id: string;
  title: string;
  url: string;
}

interface BookmarkRowProps {
  bm: Bookmark;
  onDelete: (id: string) => void;
}

function BookmarkRow({ bm, onDelete }: BookmarkRowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(`Rendering bookmark: ${bm.id}`);
  return (
    <div className="w-full group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center hover:border-blue-200 hover:shadow-md transition-all duration-300">
      {/* Bookmark Info */}
      <div className="flex-1 min-w-0 mr-6">
        <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
          {bm.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <a
            href={bm.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 truncate hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            {bm.url}
          </a>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          onDelete(bm.id);
          setIsModalOpen(false);
        }}
        title={bm.title}
      />
    </div>
  );
}

// Memoize row for stable rendering
export default React.memo(BookmarkRow, (prev, next) => {
  return prev.bm === next.bm && prev.onDelete === next.onDelete;
});
