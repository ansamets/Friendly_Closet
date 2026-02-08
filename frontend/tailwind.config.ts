// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [
//     "./pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         // A soft, warm off-white background
//         background: "#FAFAF9", // Stone-50

//         // High contrast but softer than pure black
//         primary: "#292524",    // Stone-800
//         muted: "#78716C",      // Stone-500

//         // The Pastel Palette
//         pastel: {
//           blue: "#E0F2FE",   // Sky-100
//           purple: "#F3E8FF", // Purple-100
//           green: "#DCFCE7",  // Emerald-100
//           pink: "#FCE7F3",   // Pink-100
//           orange: "#FFEDD5", // Orange-100
//           gray: "#F5F5F4",   // Stone-100
//         }
//       },
//       borderRadius: {
//         'xl': '1rem',
//         '2xl': '1.5rem',
//         '3xl': '2rem',
//       }
//     },
//   },
//   plugins: [],
// };
// export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          mint: "#E0F2F1",
          lavender: "#F3E5F5",
          peach: "#FFF3E0",
          sky: "#E1F5FE",
          rose: "#FCE4EC",
        },
        brand: {
          primary: "#4DB6AC",
          accent: "#9575CD",
          warning: "#FF8A65",
          text: "#455A64",
        },
      },
      boxShadow: {
        pastel:
          "0 10px 25px -5px rgba(149, 117, 205, 0.12), 0 8px 10px -6px rgba(149, 117, 205, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
