import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { BarChart3, LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const displayName = user.email ?? 'User';

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
          <BarChart3 className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
        </div>
        <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
          PM Metrics Copilot
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3">
          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="max-w-[180px] truncate">{displayName}</span>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 py-1.5 px-3 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
