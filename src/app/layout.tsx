// src/app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var t = localStorage.getItem('theme') || 'light';
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}
})();
            `,
          }}
        />
      </head>

      <body className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-50">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              // default (ใช้กับทุกประเภท ถ้าไม่ override)
              style: {
                background: "#06202A",
                color: "#CFFAFE",
                border: "1px solid #22D3EE",
              },
              iconTheme: {
                primary: "#22D3EE",
                secondary: "#06202A",
              },

              // ✅ Override สำหรับ error โดยเฉพาะ
              error: {
                style: {
                  background: "#450a0a", // dark red
                  color: "#FECACA", // light red/pink
                  border: "1px solid #F87171", // red border
                },
                iconTheme: {
                  primary: "#F87171", // red
                  secondary: "#450a0a",
                },
              },

              // ✅ Optional: success
              success: {
                style: {
                  background: "#064e3b", // deep green
                  color: "#BBF7D0",
                  border: "1px solid #22c55e",
                },
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#064e3b",
                },
              },
            }}
          />

        </ThemeProvider>
      </body>
    </html>
  );
}
