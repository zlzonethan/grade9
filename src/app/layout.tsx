import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Classroom · Class 9B",
  description: "Shared homework, tests, reminders, and announcements for Class 9B.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
