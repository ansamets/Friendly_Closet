import BottomNav from "@/components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Outer Container: Centers content on desktop, handles background
    <div className="min-h-screen bg-stone-200 flex justify-center items-center">

      {/* 2. Mobile Container: Constrained width, white background, rounded corners */}
      <div className="w-full max-w-md bg-white h-screen sm:h-[88vh] shadow-2xl relative flex flex-col sm:rounded-3xl overflow-hidden">

        {/* 3. Main Content: Takes up all available space (flex-1) */}
        <main className="flex-1 overflow-y-auto p-4 pb-20">
            {children}
        </main>

        {/* 4. Bottom Nav: MUST BE LAST */}
        <BottomNav />

      </div>
    </div>
  );
}
