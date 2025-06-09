"use strict";
// app/components/SidebarLayout.tsx
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SidebarLayout;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
function SidebarLayout({ children, }) {
    const [sidebarOpen, setSidebarOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768)
                setSidebarOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return (<div className="flex min-h-screen">
      {/* Sidebar */}
      <div className={`fixed z-40 inset-y-0 left-0 w-64 bg-white border-r shadow-md px-6 py-8 space-y-8 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-blue-700 tracking-tight">
            TradingCoach
          </h2>
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <lucide_react_1.X className="w-6 h-6"/>
          </button>
        </div>

        <nav className="flex flex-col space-y-3">
          <SidebarLink href="/onboarding" icon={<lucide_react_1.Brain />} label="Your Profile" setSidebarOpen={setSidebarOpen}/>
          <SidebarLink href="/upload" icon={<lucide_react_1.Upload />} label="Upload & Analyze" setSidebarOpen={setSidebarOpen}/>
          <SidebarLink href="/history" icon={<lucide_react_1.BarChart2 />} label="Analysis" setSidebarOpen={setSidebarOpen}/>
          <SidebarLink href="/chat" icon={<lucide_react_1.MessageCircle />} label="Trading Chat" setSidebarOpen={setSidebarOpen}/>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden px-4 py-3 bg-white border-b shadow-sm flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 hover:text-blue-700 p-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Open sidebar">
            <lucide_react_1.Menu className="w-6 h-6"/>
          </button>
          <h2 className="text-lg font-semibold text-blue-700">TradingCoach</h2>
          <div className="w-6"/>
        </div>
        <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-10 bg-gradient-to-b from-white to-gray-50 overflow-x-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>);
}
function SidebarLink({ href, icon, label, setSidebarOpen, }) {
    const pathname = (0, navigation_1.usePathname)();
    const isActive = pathname === href;
    return (<link_1.default href={href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2 rounded-lg group transition-all duration-200 font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-800 ${isActive ? "bg-blue-100 text-blue-800" : ""}`}>
      <span className="text-xl transform group-hover:translate-x-1 transition-transform duration-200">
        {icon}
      </span>
      <span className="text-base">{label}</span>
    </link_1.default>);
}
