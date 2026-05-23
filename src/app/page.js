import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold tracking-wider text-indigo-400">Aeterna AR</h1>
        <Link href="/login" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/30">
          Partner Login
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto text-center px-6 py-20 flex-grow flex flex-col justify-center items-center">
        <span className="bg-indigo-500/10 text-indigo-400 text-sm font-medium px-4 py-1.5 rounded-full border border-indigo-500/20 mb-6">
          Next-Generation Restaurant Platform
        </span>
        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
          Bring Your Menu to Life with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">3D Augmented Reality</span>
        </h2>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Create an immersive dining experience. Let customers view 3D models of your dishes right on their tables via a simple QR code scan. No application download required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/login" className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 py-4 rounded-xl transition duration-200 text-center shadow-xl">
            Get Started (Create Restaurant Account)
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-slate-500 border-t border-slate-800/5xl">
        &copy; {new Date().getFullYear()} Aeterna AR. All rights reserved.
      </footer>
    </div>
  );
        }
        
