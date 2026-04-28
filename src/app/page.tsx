import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight">
          Hi, I'm <span className="text-blue-600">Lin Htet Aung</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Electronics & Communications Engineer transitioning into 
          <span className="font-semibold text-gray-900"> AI Research</span>. 
          I build technical projects, solve logic puzzles, and write about the future of tech.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/projects" className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all">
            View My Projects
          </Link>
          <Link href="/puzzles" className="px-8 py-3 bg-white text-blue-600 border border-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all">
            Play Puzzles
          </Link>
        </div>
      </div>
      
      {/* Visual Placeholder for Recent Posts Section */}
      <div className="mt-24 border-t border-gray-100 pt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest from the Blog</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-50 rounded-xl border border-gray-100 animate-pulse flex items-center justify-center text-gray-300">
              Post Loading...
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}