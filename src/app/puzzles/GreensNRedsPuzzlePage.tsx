import GreensAndReds from '@/components/puzzles/GreensAndReds/GreensAndReds';

export default function GreensAndRedsPuzzlePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
      
      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Logic Puzzles
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          A collection of interactive challenges I engineered from scratch using React, TypeScript, and state-driven algorithms.
        </p>
      </div>

      {/* The "Console" Area */}
      <div className="max-w-3xl mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-8 shadow-sm">
        
        {/* We "plug in" the game cartridge right here */}
        <GreensAndReds />
        
      </div>
      
    </div>
  );
}