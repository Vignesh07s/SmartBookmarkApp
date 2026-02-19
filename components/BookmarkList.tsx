  "use client";

  import { useState, useEffect, useCallback, useMemo } from "react";
  import { createClient } from "@/utils/supabase/client";
  import { deleteBookmark } from "@/app/actions/bookmarks";
  import { Search } from "lucide-react";
  import BookmarkRow from "./BookmarkRow";
  import { toast } from "sonner";

  interface Bookmark {
    id: string;
    title: string;
    url: string;
    created_at: string;
  }

  interface BookmarkListProps {
    initialBookmarks: Bookmark[];
  }

  export default function BookmarkList({ initialBookmarks }: BookmarkListProps) {
    // Normalize bookmarks for stable references
    const [bookmarksMap, setBookmarksMap] = useState<Record<string, Bookmark>>(
      () => {
        const map: Record<string, Bookmark> = {};
        initialBookmarks.forEach((bm) => (map[bm.id] = bm));
        return map;
      },
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const supabase = createClient();

    // Delete bookmark handler
    const handleDelete = useCallback(async (id: string) => {
      const formData = new FormData();
      formData.append("id", id);
      await deleteBookmark(formData);

      setBookmarksMap((prev) => {
        const newMap = { ...prev };
        delete newMap[id];
        return newMap;
      });
    }, []);

    // Debounce search input
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedQuery(searchQuery), 200);
      return () => clearTimeout(handler);
    }, [searchQuery]);

    // Merge initialBookmarks for multi-tab / revalidate support
    useEffect(() => {
      setBookmarksMap((prev) => {
        const newMap = { ...prev };
        initialBookmarks.forEach((bm) => {
          newMap[bm.id] = prev[bm.id] || bm; // keep old reference if exists
        });
        return newMap;
      });
    }, [initialBookmarks]);

    // Supabase realtime subscription
    useEffect(() => {
      const channel = supabase
        .channel("realtime-bookmarks")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bookmarks" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setBookmarksMap((prev) => ({
                ...prev,
                [payload.new.id]: payload.new,
              }));
              toast.success("Bookmark added");
            } else if (payload.eventType === "DELETE") {
              setBookmarksMap((prev) => {
                const newMap = { ...prev };
                delete newMap[payload.old.id];
                return newMap;
              });
              toast.error("Bookmark deleted");
            }
          },
        )
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ online_at: new Date().toISOString() });
          }
          if (status === "CHANNEL_ERROR") {
            console.error("WebSocket failed. Check RLS or network.");
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }, [supabase]);

    // Convert map to array & filter by debounced search
    const filteredBookmarks = useMemo(() => {
      return Object.values(bookmarksMap).filter(
        (bm) =>
          bm.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          bm.url?.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [bookmarksMap, debouncedQuery]);

    return (
      <div className="space-y-6 w-full max-w-2xl mx-auto">
        {/* Search Input */}
        <div className="relative group w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          />
        </div>

        {/* Bookmark Rows */}
        <div className="flex flex-col gap-4 w-full">
          {filteredBookmarks.map((bm) => (
            <BookmarkRow key={bm.id} bm={bm} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    );
  }
