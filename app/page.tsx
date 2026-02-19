import { createClient } from "@/utils/supabase/server";
import AuthButton from "@/components/AuthButton";
import AddBookmarkForm from "@/components/AddBookmarkForm";
import BookmarkList from "@/components/BookmarkList";
import { LogOut } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Fetch initial bookmarks on the server
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  const userName = user?.user_metadata?.full_name || user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-blue-100">
      {/* Header Section */}
      <header className="w-full bg-[#f2f6ed] border-b border-slate-100 p-2">
        <div className=" mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-6 md:px-12">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-500 tracking-tight italic leading-tight">
              Smart Bookmark Manager
            </h1>
            <p className="text-slate-950 font-medium mt-1 md:mt-1 text-lg md:text-xl">
              Organize your bookmarks seamlessly in real-time
            </p>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="profile"
                    className="w-12 h-12 rounded-full border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {userName?.[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xl font-bold text-slate-800 truncate max-w-35 md:max-w-xs">
                  {userName}
                </span>
              </div>

              <form
                action="/auth/signout"
                method="post"
                className="flex items-center"
              >
                <button
                  className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-2 py-16">
        {!user ? (
          /* Landing State */
          /* Landing State */
          /* Landing State */
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm px-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🔖</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              Save. Sync. Access.
              <span className="text-blue-600"> Instantly.</span>
            </h1>

            <p className="text-slate-600 mb-6 max-w-sm mx-auto text-base">
              A real-time bookmark manager with Google login and secure user
              isolation.
            </p>

            <AuthButton />

            <p className="text-xs text-slate-400 mt-5">
              Google login • Real-time updates • Private by default
            </p>
          </div>
        ) : (
          /* App State */
          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-8 px-2">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Your Bookmarks
                  </h2>
                </div>

                {/* Button is now part of the section header */}
                <AddBookmarkForm />
              </div>

              <BookmarkList
                initialBookmarks={bookmarks || []}
                userId={user.id}
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
