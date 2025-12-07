import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mangatoon - Image to Manga Converter",
  description: "Convert your images to manga style",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
