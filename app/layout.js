import "./globals.css";

export const metadata = {
  title: "AI Image Generator",
  description: "Free AI image generator — kono cost lage na",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
    }
