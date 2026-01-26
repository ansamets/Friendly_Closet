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

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Outer Grey Background (Desktop Center)
    <div className="min-h-screen bg-stone-200 flex justify-center items-center sm:py-8">

      {/* 2. Mobile App Container (White Box) */}
      <div className="w-full max-w-md bg-white h-[100svh] sm:h-[85vh] shadow-2xl flex flex-col sm:rounded-3xl overflow-hidden border border-stone-300">

        {/* 3. Main Content (The Map/Feed) */}
        {/* flex-1 makes it take up all available space, pushing the nav down */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 pb-24">
            {children}
        </main>

        {/* 4. Bottom Nav */}
        <div className="flex-shrink-0">
          <BottomNav />
        </div>

      </div>
    </div>
  );
}
