import React, { useState } from "react";
import { ListFilter, Search, PlusCircle, Building2, TrendingUp, AlertTriangle, ShieldCheck, Cpu, Pill, Cloud, ShieldAlert } from "lucide-react";
import { DDProject } from "../types";

interface ProjectListProps {
  projects: DDProject[];
  onSelectProject: (id: string) => void;
  onAddProject: (newProj: any) => void;
}

export default function ProjectList({ projects, onSelectProject, onAddProject }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newIndustry, setNewIndustry] = useState("半导体设计与芯片制造");
  const [newTargetAmount, setNewTargetAmount] = useState("5,000万人民币");
  const [newLeadPM, setNewLeadPM] = useState("项目投资组");
  const [newDescription, setNewDescription] = useState("");
  const [newRiskLevel, setNewRiskLevel] = useState<"低" | "中" | "高">("中");

  const statuses = ["全部", "立项中", "现场尽调中", "报告撰写中", "投决会审核", "已归档"];

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.leadPM.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchRisk = riskFilter === "all" || p.riskLevel === riskFilter;
    return matchSearch && matchStatus && matchRisk;
  });

  const getIndustryIcon = (industry: string) => {
    if (industry.includes("半导体") || industry.includes("芯片")) return <Cpu className="h-4 w-4 text-teal-600" />;
    if (industry.includes("医药") || industry.includes("医疗")) return <Pill className="h-4 w-4 text-rose-600" />;
    return <Cloud className="h-4 w-4 text-blue-600" />;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      alert("请输入拟投资标的名称！");
      return;
    }
    const defaultChecklists = [
      {
        id: `c_${Date.now()}_1`,
        category: "资产和负债情况" as const,
        title: "自查主要固定资产账物相符程度及权属文件",
        description: "调阅近三年有形资产账面明细，对主要机器研发设备在现场进行实物抽样编号核对，检查对应合同发票。",
        importance: "高" as const,
        status: "未开始" as const,
        assignee: newLeadPM,
        sourceDocs: ["固定资产台账", "购置发票与银行单据"],
        uploadedDocs: []
      },
      {
        id: `c_${Date.now()}_2`,
        category: "经营和财务情况" as const,
        title: "主要收入与递延摊销账目抽样校验",
        description: "抽取重点客户账单和回单证明，评估收入分摊和经常性ARR增长的账面真实合规性。",
        importance: "高" as const,
        status: "未开始" as const,
        assignee: newLeadPM,
        sourceDocs: ["收入明细流水", "大客户服务协议合规影本"],
        uploadedDocs: []
      },
      {
        id: `c_${Date.now()}_3`,
        category: "法律关系" as const,
        title: "工商历史章程与代持/质押对赌协议自查",
        description: "获取在册历史章程修正，追索潜在表外对赌赔偿，确保创始人股权无第三方代持诉讼纠纷。",
        importance: "高" as const,
        status: "未开始" as const,
        assignee: newLeadPM,
        sourceDocs: ["工商历史底档", "对赌确认函"],
        uploadedDocs: []
      },
      {
        id: `c_${Date.now()}_4`,
        category: "机会与潜在风险" as const,
        title: "白盒产品专利技术壁垒与诉讼防线审查",
        description: "审核是否含大量限制性开源协议代码，排摸核心工程师离职时前雇主竞业承诺解除函。",
        importance: "中" as const,
        status: "未开始" as const,
        assignee: newLeadPM,
        sourceDocs: ["专利检索评级报告", "竞业解除影印件"],
        uploadedDocs: []
      }
    ];

    onAddProject({
      id: `proj_custom_${Date.now()}`,
      companyName: newCompanyName,
      industry: newIndustry,
      targetAmount: newTargetAmount,
      leadPM: newLeadPM,
      status: "立项中",
      completeness: 0,
      riskLevel: newRiskLevel,
      description: newDescription || "暂无具体背景说明。",
      financialSummary: "账面研发费用及资产周转正常，待现场穿透审计核查。",
      coreAssets: "核心技术专利及实验室技术积累。",
      coreLiabilities: "短期经营欠款和可能存在的股权回购压力。",
      checklists: defaultChecklists
    });

    setNewCompanyName("");
    setNewDescription("");
    setShowAddForm(false);
    alert(`成功注册新项目 『${newCompanyName}』，已自动套用四大维度标准化尽职调查初始事项！`);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="project-list-panel">
      {/* Header section with CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-150 pb-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-850 flex items-center space-x-2">
            <Building2 className="h-5.5 w-5.5 text-teal-600" />
            <span>私募拟投资项目全生命周期台账</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            投资决策前对所有备选项目统一立项，对现场尽调进展、团队归口职责和核心风控底线一屏透视。
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 shadow-sm transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>新项目立项登记</span>
        </button>
      </div>

      {/* Filter and search toolbox */}
      <div className="bg-white border rounded-xl p-4 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索标的企业名称、PM或赛道..."
            className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 pl-8 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
          />
          <Search className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-gray-400" />
        </div>

        {/* Status filtering */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs bg-neutral-50 rounded-lg border border-neutral-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold text-neutral-700"
          >
            <option value="all">📂 过滤项目进度（全部进度）</option>
            <option value="立项中">立项中</option>
            <option value="现场尽调中">现场尽调中</option>
            <option value="报告撰写中">报告撰写中</option>
            <option value="投决会审核">投决会审核</option>
            <option value="已归档">已归档</option>
          </select>
        </div>

        {/* Risk level filtering */}
        <div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full text-xs bg-neutral-50 rounded-lg border border-neutral-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold text-neutral-700"
          >
            <option value="all">🚨 过滤风险级别（全部级别）</option>
            <option value="低">低风险级别</option>
            <option value="中">中风险级别</option>
            <option value="高">高风险级别</option>
          </select>
        </div>

        {/* Total stats feedback */}
        <div className="flex items-center justify-end px-2 text-2xs text-gray-400 font-bold uppercase select-none">
          搜索到符合条件的项目：{filteredProjects.length} / {projects.length} 个
        </div>
      </div>

      {/* Projects Grid Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full bg-white border border-dashed rounded-xl p-16 text-center text-gray-400 text-xs">
            未发现与检索项匹配的拟投资标的公司。请点击大厅右上角进行“新项目立项登记”。
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const hasHighRisk = proj.riskLevel === "高";
            const completedCount = proj.checklists.filter(i => i.status === "已审核").length;
            const totalCount = proj.checklists.length;

            return (
              <div
                key={proj.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-teal-500 shadow-2xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Visual top border or header highlight */}
                <div className={`h-1.5 w-full ${
                  proj.status === "已归档"
                    ? "bg-neutral-400"
                    : proj.status === "投决会审核"
                      ? "bg-purple-650"
                      : "bg-teal-650"
                }`}></div>

                {/* Body content */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center space-x-1.5 bg-neutral-50/50 hover:bg-neutral-50 px-2 py-1 rounded border border-neutral-150">
                      {getIndustryIcon(proj.industry)}
                      <span className="text-3xs font-bold text-neutral-600 truncate max-w-[130px]">{proj.industry}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-4xs font-bold ${
                      proj.status === "已归档"
                        ? "bg-neutral-100 text-neutral-600"
                        : proj.status === "现场尽调中"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : proj.status === "投决会审核"
                            ? "bg-purple-50 text-purple-800 border border-purple-200"
                            : "bg-teal-50 text-teal-800 border border-teal-200"
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900 break-all leading-snug hover:text-teal-600 transition-colors">
                      {proj.companyName}
                    </h3>
                    <p className="text-2xs text-gray-500 leading-relaxed line-clamp-3">
                      {proj.description}
                    </p>
                  </div>

                  {/* Core indicators */}
                  <div className="grid grid-cols-2 gap-3 bg-neutral-50/55 p-3 rounded-lg text-2xs border border-neutral-100 font-sans">
                    <div>
                      <span className="text-gray-400 block text-3xs font-semibold">拟投资金额</span>
                      <span className="font-bold text-gray-700 block mt-0.5">{proj.targetAmount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-3xs font-semibold">领投PM</span>
                      <span className="font-bold text-gray-700 block mt-0.5">{proj.leadPM}</span>
                    </div>
                  </div>

                  {/* Operational stats row */}
                  <div className="flex items-center justify-between text-2xs text-gray-500 pt-1">
                    <span className="font-semibold text-gray-600">
                      核心事项核查项：<span className="text-teal-600 font-bold">{completedCount}/{totalCount}</span>
                    </span>

                    <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded font-bold text-3xs ${
                      hasHighRisk ? "bg-rose-50 text-rose-700" : "bg-neutral-100 text-neutral-600"
                    }`}>
                      {hasHighRisk && <AlertTriangle className="h-3 w-3 text-rose-600" />}
                      <span>风控分级：{proj.riskLevel}</span>
                    </span>
                  </div>

                  {/* ProgressBar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-3xs text-gray-400 font-bold">
                      <span>整体核定进度</span>
                      <span>{proj.completeness}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          proj.completeness > 80 ? "bg-teal-600" : proj.completeness > 40 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${proj.completeness}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => onSelectProject(proj.id)}
                    className="w-full py-2 bg-neutral-50 hover:bg-teal-50 hover:text-teal-800 text-neutral-700 hover:cursor-pointer text-xs font-semibold rounded-lg border border-neutral-200 hover:border-teal-200 transition-all flex items-center justify-center space-x-1"
                  >
                    <span>详情&专项查核入口 →</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* POPUP MODAL: Add New custom Project */}
      {showAddForm && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 border border-neutral-150 animate-fade-in font-sans">
            <div className="flex justify-between items-center border-b border-gray-150 pb-3 mb-4">
              <h3 className="text-md font-bold text-neutral-800 flex items-center">
                <PlusCircle className="h-5 w-5 text-teal-600 mr-1.5" />
                <span>股权投资拟投项目建档立项</span>
              </h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">拟投资标的公司全称 *</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="例如：晶云新材料科技股份有限公司"
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 font-medium focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">所属特定细分赛道 *</label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 font-medium focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="半导体设计与芯片制造">半导体与车规芯片</option>
                    <option value="生物医药研发与新药制造">生物制造与抗体制药</option>
                    <option value="云计算与网络安全SaaS">网络安全与云SaaS</option>
                    <option value="新能源与高端重装备制造">新能源电调设备</option>
                  </select>
                </div>

                <div>
                  <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">拟投资额度估算</label>
                  <input
                    type="text"
                    value={newTargetAmount}
                    onChange={(e) => setNewTargetAmount(e.target.value)}
                    placeholder="9,000万人民币"
                    className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 font-semibold focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">项目领投PM (项目负责人)</label>
                  <input
                    type="text"
                    value={newLeadPM}
                    onChange={(e) => setNewLeadPM(e.target.value)}
                    placeholder="投资经理-小段"
                    className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 font-medium focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">风控风险评级分拨 *</label>
                  <select
                    value={newRiskLevel}
                    onChange={(e) => setNewRiskLevel(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 font-bold focus:ring-1 focus:ring-teal-500 text-rose-700"
                  >
                    <option value="高">🚨 高风险分级（重资产或代持风险）</option>
                    <option value="中">⚠ 中风险分级（常规轻资产SaaS等）</option>
                    <option value="低">✅ 低风险分级（现金流已转正）</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">项目核心优势与基本面背景</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="请输入企业当前的产品核心、高管团队构成以及本次资本运作的主打底牌..."
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 h-24 focus:ring-1 focus:ring-teal-500 text-neutral-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-neutral-150">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 rounded-lg shadow-sm"
                >
                  确认建档立项
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
