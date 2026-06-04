import { Search, House, ChevronRight, Bell, Calendar, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200/80 px-3 lg:px-4 py-2 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-3">
        {/* Left side */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pl-10 lg:pl-0">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
            <a
              href="/dashboard"
              className="text-gray-400 hover:text-primary-600 transition-colors shrink-0"
            >
              <House size={15} />
            </a>
            <span className="flex items-center gap-1.5 min-w-0">
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
              <span className="font-medium text-gray-900 truncate">student-dashboard</span>
            </span>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search bar */}
          <button
            className="hidden sm:flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border border-gray-300 bg-gray-50 hover:bg-white hover:border-primary-400 hover:shadow-sm transition-all duration-150 text-gray-400 hover:text-gray-600 w-32 sm:w-52 lg:w-64"
            aria-label="Search or navigate"
          >
            <Search size={14} className="shrink-0 text-gray-400" />
            <span className="flex-1 text-left text-xs text-gray-400 truncate">
              Search or navigate...
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-400 font-mono shrink-0">
              Ctrl+/
            </kbd>
          </button>

          {/* Term badge */}
          <div className="hidden sm:flex items-center gap-2.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
            <Calendar size={15} className="text-primary-600 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-900">
                SEPTEMBER 2025–2026
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Closed
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-gray-200 hidden sm:block" />

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-1.5 rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
          </div>

          {/* User profile */}
          <div className="relative">
            <button
              className="flex items-center gap-2 p-1 rounded-lg transition-all duration-150 hover:bg-gray-50"
              title="Rukundo Don Divin - Student"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                RD
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  Rukundo Don Divin
                </p>
                <p className="text-[11px] text-gray-500 leading-tight">Student</p>
              </div>
              <ChevronDown
                size={14}
                className="text-gray-400 hidden sm:block transition-transform duration-200"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
