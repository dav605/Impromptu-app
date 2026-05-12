export function Header({ currentTab, setCurrentTab }) {
  const navItems = ['Home'];

  return (
    <header className="px-8 py-5 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-50 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="text-2xl font-extrabold text-slate-800 flex items-center gap-2 tracking-tight cursor-pointer" onClick={() => setCurrentTab('Home')}>
        <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        </div>
        Softskills
      </div>
      <nav className="flex gap-8 text-sm font-semibold text-slate-500">
        {navItems.map(item => (
          <button 
            key={item}
            onClick={() => setCurrentTab(item)}
            className={`transition-colors hover:text-brand-primary ${currentTab === item ? 'text-brand-primary border-b-2 border-brand-primary pb-1' : ''}`}
          >
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
}
