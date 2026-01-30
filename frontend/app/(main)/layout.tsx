// import BottomNav from "@/components/BottomNav";

// export default function MainLayout({ children }: { children: React.ReactNode }) {
//   return (
//     // 1. Outer Container: Centers content on desktop, handles background
//     <div className="min-h-screen bg-stone-200 flex justify-center items-center">

//       {/* 2. Mobile Container: Constrained width, white background, rounded corners */}
//       <div className="w-full max-w-md bg-white h-screen sm:h-[88vh] shadow-2xl relative flex flex-col sm:rounded-3xl overflow-hidden">

//         {/* 3. Main Content: Takes up all available space (flex-1) */}
//         <main className="flex-1 min-h-0 overflow-y-auto p-4">
//             {children}
//         </main>

//         {/* 4. Bottom Nav: MUST BE LAST */}
//         <BottomNav />

//       </div>
//     </div>
//   );
// }
import BottomNav from "@/components/BottomNav";
import type { Metadata, Viewport } from "next";

// This tells mobile browsers how to treat the app window
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents annoying auto-zoom on input focus
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Friendly Closet",
  description: "Organize your wardrobe with Gemini AI",
  manifest: "/manifest.json", // This links to your manifest file
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Friendly Closet",
  },
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    // Added 'touch-none' and 'overscroll-none' logic to prevent "web-like" scrolling bounces
    <div className="min-h-screen bg-stone-200 flex justify-center items-center sm:py-8 selection:bg-stone-500/30">

      {/* Container with 'overscroll-contain' prevents the whole page from bouncing when scrolling closet items */}
      <div className="w-full max-w-md bg-white h-[100svh] sm:h-[85vh] shadow-2xl flex flex-col sm:rounded-3xl overflow-hidden border border-stone-300 overscroll-none">

        {/* Main Content */}
        {/* Added 'select-none' so users don't accidentally highlight text while tapping UI buttons */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 pb-24 select-none">
            {children}
        </main>

        {/* Bottom Nav */}
        <div className="flex-shrink-0">
          <BottomNav />
        </div>

      </div>
    </div>
  );
}
