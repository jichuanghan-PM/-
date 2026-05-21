import { ShieldCheck, Layers, ClipboardList, Milestone, CheckSquare, AlertTriangle, FileText } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const menuItems = [
    { id: "dashboard", label: "1. 首页工作台", icon: Layers },
    { id: "project-list", label: "2. 项目全列表", icon: ClipboardList },
    { id: "project-detail", label: "3. 详情与流程", icon: Milestone },
    { id: "special-checks", label: "4. 五大专项核查", icon: CheckSquare },
    { id: "archive", label: "5. 资料归档文库", icon: ShieldCheck },
    { id: "risk-assessment", label: "6. 风险评估评级", icon: AlertTriangle },
    { id: "report-generator", label: "7. 报告一键生成", icon: FileText }
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo & Headline */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center shadow-md shadow-teal-100">
              <ShieldCheck className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-black text-gray-900 tracking-tight">私募股权尽职调查系统</span>
            </div>
          </div>

          {/* Navigation Menus */}
          <nav className="flex items-center space-x-1.5 flex-1 justify-center overflow-x-auto py-1 scrollbar-none" id="nav-tabs-desktop">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-150 shrink-0 ${
                    isActive
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:cursor-pointer"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="inline xl:hidden">{item.label.split(". ")[1]}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
