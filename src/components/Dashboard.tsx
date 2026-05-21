import { LayoutGrid, TrendingUp, AlertTriangle, FileText, CheckCircle2, ChevronRight, Sparkles, Building2, HelpCircle } from "lucide-react";
import { DDProject } from "../types";

interface DashboardProps {
  projects: DDProject[];
  onSelectProject: (projId: string) => void;
  totalDocsCount: number;
}

export default function Dashboard({ projects, onSelectProject, totalDocsCount }: DashboardProps) {
  // Filter projects by target sector chosen in survey if user desires, or show all
  const filteredProjects = projects;

  const totalProjectsCount = filteredProjects.length;
  const averageCompleteness = Math.round(
    filteredProjects.reduce((sum, p) => sum + p.completeness, 0) / (totalProjectsCount || 1)
  );

  const highRiskCount = filteredProjects.filter(p => p.riskLevel === "高").length;

  // Let's compute checklist stats for the 4 major categories
  const categoriesToCompute = [
    { name: "资产和负债情况", key: "assets" },
    { name: "经营和财务情况", key: "finance" },
    { name: "法律关系", key: "legal" },
    { name: "机会与潜在风险", key: "risks" }
  ];

  const categoryProgress = categoriesToCompute.map(cat => {
    let totalItems = 0;
    let completedItems = 0;

    filteredProjects.forEach(proj => {
      proj.checklists.forEach(item => {
        if (item.category === cat.name) {
          totalItems++;
          if (item.status === "已审核" || item.status === "已收集待审计") {
            completedItems++;
          }
        }
      });
    });

    const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    return {
      name: cat.name,
      total: totalItems,
      completed: completedItems,
      percent
    };
  });

  return (
    <div className="space-y-6" id="dashboard-root-panel">
      {/* 1. Header Overview Info Panel */}
      <div className="bg-gradient-to-r from-teal-800 to-indigo-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-6 pointer-events-none">
          <Building2 className="h-64 w-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-white/10 text-teal-200 border border-white/5">
              <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
              <span>智能尽调：专业内控系统运行中</span>
            </span>
            <h1 className="text-2xl font-bold tracking-tight">非上市公司股权投资尽职调查大盘</h1>
            <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
              根据非标投资规范，针对目标企业的<b>资产债务、经营财务、法律关系、退出机会和潜在风险</b>5大方向开展穿透式调查。
              系统支持归档归口材料并联动AI展开漏损核验，严防上市前由于账外债务、竞业隐患、诉讼纠纷导致估值崩塌。
            </p>
          </div>

          <div className="flex bg-white/10 backdrop-blur-xs rounded-lg p-2.5 border border-white/5 space-x-4 shrink-0">
            <div className="text-center px-2">
              <div className="text-lg font-extrabold">{totalProjectsCount}</div>
              <div className="text-4xs text-white/60">在审项目 (拟PE)</div>
            </div>
            <div className="text-center px-4 border-l border-white/10">
              <div className="text-lg font-extrabold">{averageCompleteness}%</div>
              <div className="text-4xs text-white/60">综合尽调进度</div>
            </div>
            <div className="text-center px-2 border-l border-white/10">
              <div className="text-lg font-extrabold">{totalDocsCount}份</div>
              <div className="text-4xs text-white/60">业务归档凭据</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Targeted due diligence project list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-md font-bold text-neutral-800 flex items-center space-x-1.5">
              <LayoutGrid className="h-4.5 w-4.5 text-teal-600" />
              <span>本期重点调查股权投资对象 ({filteredProjects.length})</span>
            </h2>
            <span className="text-4xs text-gray-400">点击进入事项执行即可核查材料并归档</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProjects.map((proj) => {
              const ringColor = proj.completeness > 70 ? "stroke-teal-600" : proj.completeness > 40 ? "stroke-amber-500" : "stroke-rose-500";
              const isLead = proj.id === "proj_1";
              
              return (
                <div
                  key={proj.id}
                  id={`project-card-${proj.id}`}
                  className={`bg-white rounded-xl border p-5 shadow-2xs hover:shadow-xs transition-all relative ${
                    isLead ? "border-teal-500 ring-2 ring-teal-500/5 bg-teal-50/10" : "border-gray-200"
                  }`}
                >
                  {isLead && (
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-teal-600 text-white text-[10px] font-bold rounded-full shadow-xs flex items-center">
                      <Sparkles className="h-2.5 w-2.5 mr-1" /> 重点专案标的
                    </span>
                  )}

                  <div className="space-y-4">
                    {/* Industry Title */}
                    <div>
                      <div className="text-3xs text-gray-400 font-semibold uppercase">{proj.industry}</div>
                      <h3 className="text-sm font-extrabold text-neutral-800 mt-1 break-all line-clamp-1">{proj.companyName}</h3>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 h-8 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Funding and PM information */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100/60 text-2xs">
                      <div>
                        <div className="text-gray-400">拟投金额</div>
                        <div className="font-bold text-neutral-700 mt-0.5">{proj.targetAmount}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">项目负责人</div>
                        <div className="font-bold text-neutral-700 mt-0.5">{proj.leadPM}</div>
                      </div>
                    </div>

                    {/* Progress with completeness wheel */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 shrink-0">
                          <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                              className="stroke-gray-100"
                              strokeWidth="3.5"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={`${ringColor} transition-all duration-300`}
                              strokeDasharray={`${proj.completeness}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-neutral-800">
                            {proj.completeness}%
                          </div>
                        </div>
                        <div>
                          <div className="text-3xs text-gray-400">核查项进度</div>
                          <div className="text-xs font-semibold text-neutral-700">阶段：{proj.status}</div>
                        </div>
                      </div>

                      {/* Risk Badge */}
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-3xs font-medium ${
                        proj.riskLevel === "高" 
                          ? "bg-rose-50 text-rose-700 border border-rose-200" 
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        <AlertTriangle className="h-2.5 w-2.5" />
                        <span>风险：{proj.riskLevel}</span>
                      </span>
                    </div>

                    {/* Trigger detail */}
                    <button
                      onClick={() => onSelectProject(proj.id)}
                      className="w-full flex items-center justify-center space-x-1 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50/50 hover:bg-teal-50 border border-teal-100 rounded-lg hover:cursor-pointer transition-all"
                    >
                      <span>办理该项目事项核查</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Key checklists execution statistics by Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h2 className="text-md font-bold text-neutral-800 flex items-center space-x-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-teal-600" />
              <span>4大部分查处要点综合进度图</span>
            </h2>
            <span className="text-4xs text-gray-400">全标的穿透底稿汇总</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 shadow-2xs">
            <p className="text-xs text-gray-500 leading-relaxed">
              对应于私募股权投资行业尽调核心，我们在资产负债核实、合规经营审理、未决讼诉审查等四大维度的底层尽调归纳数据：
            </p>

            <div className="space-y-4">
              {categoryProgress.map((item, index) => {
                const colors = [
                  { bar: "bg-blue-650", text: "text-blue-800", bg: "bg-blue-50" },
                  { bar: "bg-teal-600", text: "text-teal-800", bg: "bg-teal-50" },
                  { bar: "bg-indigo-600", text: "text-indigo-800", bg: "bg-indigo-50" },
                  { bar: "bg-amber-600", text: "text-amber-800", bg: "bg-amber-50" }
                ];
                const activeTheme = colors[index % colors.length];

                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700">{item.name}</span>
                      <span className={`px-2 py-0.5 rounded text-3xs font-semibold ${activeTheme.bg} ${activeTheme.text}`}>
                        {item.completed}/{item.total} 项 · {item.percent}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${activeTheme.bar} h-full rounded-full transition-all duration-550`}
                        style={{ width: `${item.percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 bg-neutral-50/50 -mx-5 -mb-5 p-4 rounded-b-xl text-3xs text-gray-500 space-y-1 leading-normal">
              <div className="font-bold text-gray-700 flex items-center">
                <FileText className="h-3 w-3 mr-1 text-gray-400" />
                非标股权投资监管底线提示：
              </div>
              <p>非上市公司缺乏强制信披，纸面财务常处于非审计状态。财务尽调必须针对真实资金收付回单、仓库固定资产所有权、代工厂受托协议以及海关进出口记录进行交叉验印(Double-Check)，严查对赌对冲债务代持隐患。</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
