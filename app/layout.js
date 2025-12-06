export const metadata = {
  title: "Mangatoon - Image to Manga Converter",
  description: "Convert your images to manga style",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
