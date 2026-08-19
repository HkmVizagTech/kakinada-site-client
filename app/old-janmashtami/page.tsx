import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Old Janmashtami Page Reference",
  description: "Archived reference preview of the earlier Sri Krishna Janmashtami landing page.",
  robots: { index: false, follow: false },
};

export default function OldJanmashtamiPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <iframe
        src="/old-janmashtami-static/index.html"
        title="Old Sri Krishna Janmashtami page reference"
        className="h-full w-full border-0"
      />
    </main>
  );
}
