// import "./globals.css";
// import { AuthProvider } from "@/context/AuthContext";
// import { Space_Grotesk, Fraunces } from "next/font/google";

// const spaceGrotesk = Space_Grotesk({
//   subsets: ["latin"],
//   variable: "--font-sans",
//   display: "swap",
// });

// const fraunces = Fraunces({
//   subsets: ["latin"],
//   variable: "--font-display",
//   display: "swap",
// });

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       {/* ADD THE CLASSES HERE INSTEAD */}
//       <body
//         className={`${spaceGrotesk.variable} ${fraunces.variable} font-sans antialiased min-h-screen`}
//       >
//         <AuthProvider>{children}</AuthProvider>
//       </body>
//     </html>
//   );
// }
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Friendly Closet",
  description: "Organize your wardrobe with Gemini AI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Friendly Closet",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* FORCE LOAD LEAFLET CSS FROM CDN */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
     crossOrigin=""/>
      </head>
      <body className={`${inter.className} bg-stone-100 text-stone-800 antialiased min-h-screen`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
