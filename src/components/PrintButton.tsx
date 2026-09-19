'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-accent text-white px-6 py-2 rounded-sm text-sm tracking-widest font-medium hover:bg-black transition-colors shadow-lg"
    >
      PRINT / DOWNLOAD PDF
    </button>
  );
}
