import { useAuth } from '../../context/AuthContext';

/**
 * Top navigation bar with mobile menu toggle
 */
const Navbar = ({ onMenuToggle }) => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      {/* Left: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden lg:block">
          <p className="text-sm font-medium text-slate-200">
            {isAdmin ? 'Admin Portal' : 'Sales Portal'}
          </p>
        </div>
      </div>

      {/* Right: User Badge */}
      <div className="flex items-center gap-3">
        <span className={`badge text-xs ${isAdmin ? 'badge-blue' : 'badge-green'}`}>
          {user?.role}
        </span>
        <span className="text-sm text-slate-400 hidden sm:block">{user?.email}</span>
      </div>
    </header>
  );
};

export default Navbar;
