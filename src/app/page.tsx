import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-10">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Portfolio in Progress</h1>
        <p className="text-lg text-gray-600">
          I'm currently rebuilding my portfolio using Next.js and Tailwind CSS.
          Stay tuned for projects and logic puzzles!
        </p>
      </div>
    </main>
  );
}
