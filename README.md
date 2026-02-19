# Smart Bookmark App

A real-time web application built using Next.js, Tailwind CSS, and Supabase to manage and sync bookmarks across multiple tabs. This project demonstrates the use of Next.js Server Actions, Supabase Realtime features and a clean UI/UX design to create a seamless bookmarking experience.

## Features

* **Google Authentication**: Secure SignUp and login using Google OAuth via Supabase.
* **Bookmark Management**: Add, view, search, and delete bookmarks with ease.
* **Real-time Sync**: Updates reflect across all open tabs instantly via Supabase WebSockets.
* **Multi-Tab Reliability**: Uses Next.js server revalidation as a fallback to keep data accurate even if a WebSocket connection becomes idle.
* **User Privacy**: A user can only see and manage their own bookmarks.
* **Fast Search**: Search through your bookmarks with a debounced input to keep the UI responsive.
* **Clean Design**: Minimalist interface built with Tailwind CSS and Lucide icons.

## Technical Stack

* **Framework**: Next.js 16.1.6 (App Router)
* **Database & Auth**: Supabase (PostgreSQL & Google Auth)
* **Real-time**: Supabase Postgres Changes (WebSockets)
* **Styling**: Tailwind CSS
* **In-app notifications**: Sonner (Customized real-time toasts)

## Challenges & Solutions

### 1. Fixing connection idle issues with websockets

**Problem**: Relying only on real-time WebSockets was risky because the connection can easily drop due to poor network or a browser tab going to sleep. When the socket fails, the UI becomes a "zombie," meaning it won't show any new bookmarks or changes made from other devices.

**Solution**: I implemented a Hybrid Sync architecture. While Supabase Realtime handles instant updates, I added Next.js revalidatePath inside my Server Actions as a backup. This force-pushes the latest database state through a standard HTTP stream. Even if the WebSocket connection is lost, the UI stays accurate and synchronized by pulling the data directly from the server.

### 2. State-Prop Mismatch after Server Revalidation

**Problem**: In Next.js, calling revalidatePath updates the server-side data and pushes a new initialBookmarks prop to the client component. However, the client component does not unmount during this process, so the useState(initialBookmarks) hook does not re-run. Since React state only initializes on the first mount, the UI will display the old state even though the underlying props have changed.

**Solution**: I implemented a "State Sync" mechanism using a useEffect hook with initialBookmarks as a dependency. This ensures that whenever the server re-validates the data and pushes a new prop, the local bookmarks state is manually updated to match the updated data.

### 3. Unnecessary re-renders during Addition or Deletion of a bookmark

**Problem**: When adding or deleting a bookmark, the whole BookmarkList component is re-rendering, which results in performance issues if the list is long.

**Solution**: To fix this, I separated the row into a standalone component and wrapped it in React.memo, but the re-rendering persisted because storing bookmarks in a standard array created fresh object references on every update. Since React.memo uses shallow comparison, it treated every bookmark as "new" and forced a full re-render. I then solved this by switching to a Map keyed by ID, which allowed me to merge state while preserving the original object references for unchanged bookmarks. This reference stability ensures React.memo skips unaffected rows, updating only the specific bookmark being added or deleted.

### 4. Whole list re-render during addition of a bookmark

**Problem**: Even after using a Map and React.memo, adding a new bookmark was still triggering a full list re-render. Every existing row was being re-drawn in the DOM the moment a new one was inserted.

**Solution**: To fix this, I used a sort inside useMemo to keep the list in a "Newest First" order. Because Maps don't have a fixed order, adding a new item triggers the full list re-render. By forcing an order, existing bookmarks stay in their exact same spots when a new one is added at the top. This allows React.memo to see that the old rows haven't actually changed, so it skips re-rendering them.

## Setup Instructions

1. **Clone the repository**:

    ```bash
    git clone https://github.com/Vignesh07s/SmartBookmarkApp.git
    ```

2. **Install dependencies**:

    ```bash
    pnpm install
    ```

3. **Environment Variables**:
    Create a `.env.local` file with your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    ```

4. **Run the development server**:

    ```bash
    pnpm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Deployment

This app is deployed on vercel. You can view it live at: []()