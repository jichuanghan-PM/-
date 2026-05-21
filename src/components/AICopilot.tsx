import { useState } from "react";
import { Sparkles, Activity, FileQuestion, Send, RefreshCw, AlertTriangle, ShieldCheck, CheckSquare, Compass, Copy } from "lucide-react";
import { DDProject, ChecklistItem } from "../types";

interface AICopilotProps {
  projects: DDProject[];
  activeProjectId: string;
  onApplyAIChecklist: (projId: string, categories: { name: string; items: any[] }[]) => void;
}

export default function AICopilot({ projects, activeProjectId, onApplyAIChecklist }: AICopilotProps) {
  const [selectedProjId, setSelectedProjId] = useState<string>(activeProjectId);
  const activeProj = projects.find(p => p.id === selectedProjId) || projects[0];

  const [activeSubTab, setActiveSubTab] = useState<"checklist" | "redflags" | "interview">("checklist");

  // Loading States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Outputs States
  const [checklistResult, setChecklistResult] = useState<any>(null);
  const [redFlagsResult, setRedFlagsResult] = useState<any>(null);
  const [interviewResult, setInterviewResult] = useState<any>(null);

  // Input states (seeding with activeProj by default, but editable)
  const [companyNameStr, setCompanyNameStr] = useState(activeProj.companyName);
  const [industryStr, setIndustryStr] = useState(activeProj.industry);
  const [descriptionStr, setDescriptionStr] = useState(activeProj.description);

  const [financialSummaryStr, setFinancialSummaryStr] = useState(activeProj.financialSummary || "");
  const [coreAssetsStr, setCoreAssetsStr] = useState(activeProj.coreAssets || "");
  const [coreLiabilitiesStr, setCoreLiabilitiesStr] = useState(activeProj.coreLiabilities || "");

  const [selectedRoles, setSelectedRoles] = useState<string[]>(["创始人/CEO", "财务总监(CFO)", "技术/生产负责人"]);

  // Sync inputs when project changes
  const handleProjectSelectChange = (projId: string) => {
    setSelectedProjId(projId);
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      setCompanyNameStr(proj.companyName);
      setIndustryStr(proj.industry);
      setDescriptionStr(proj.description || "");
      setFinancialSummaryStr(proj.financialSummary || "");
      setCoreAssetsStr(proj.coreAssets || "");
      setCoreLiabilitiesStr(proj.coreLiabilities || "");
      // Reset prior generated reports to invite fresh calls
      setChecklistResult(null);
      setRedFlagsResult(null);
      setInterviewResult(null);
    }
  };

  // 1. Generate customized DD checklist plan
  const handleGenerateChecklist = async () => {
    if (!companyNameStr || !industryStr) {
      setErrorMessage("请先填写或选择标的公司名称及所属行业！");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setChecklistResult(null);

    try {
      const response = await fetch("/api/gemini/generate-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyNameStr,
          industry: industryStr,
          description: descriptionStr
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败，状态码：${response.status}`);
      }

      const data = await response.json();
      if (data.categories) {
        setChecklistResult(data);
      } else {
        throw new Error("返回的数据结构不符合预期");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "由于外部模型服务繁忙，未能生成方案。您可以稍后再次尝试核算。");
    } finally {
      setLoading(false);
    }
  };

  // 2. Analyze financial Red Flags
  const handleAnalyzeRedFlags = async () => {
    setLoading(true);
    setErrorMessage("");
    setRedFlagsResult(null);

    try {
      const response = await fetch("/api/gemini/analyze-risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyNameStr,
          industry: industryStr,
          financialSummary: financialSummaryStr,
          coreAssets: coreAssetsStr,
          coreLaibilities: coreLiabilitiesStr
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败，状态码：${response.status}`);
      }

      const data = await response.json();
      if (data.redFlags) {
        setRedFlagsResult(data);
      } else {
        throw new Error("返回的红旗分析不符合预期");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "未能取得风控红旗分析结论。");
    } finally {
      setLoading(false);
    }
  };

  // 3. Draft Interview questions
  const handleDraftInterview = async () => {
    setLoading(true);
    setErrorMessage("");
    setInterviewResult(null);

    try {
      const response = await fetch("/api/gemini/draft-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyNameStr,
          industry: industryStr,
          description: descriptionStr,
          roles: selectedRoles
        })
      });

      if (!response.ok) {
        throw new Error(`请求失败，状态码：${response.status}`);
      }

      const data = await response.json();
      if (data.interviews) {
        setInterviewResult(data);
      } else {
        throw new Error("返回的访谈模板不符合预期");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "未能取得面谈设计提纲。");
    } finally {
      setLoading(false);
    }
  };

  // One-key seed AI results to workspace active target
  const handleApplyChecklistToProject = () => {
    if (!checklistResult?.categories) return;
    onApplyAIChecklist(selectedProjId, checklistResult.categories);
    alert(`人工智能生成的 ${checklistResult.categories.reduce((acc: number, cur: any) => acc + cur.items.length, 0)} 项细化尽调事项已成功覆盖填充并部署至『${companyNameStr}』执行看板！`);
  };

  const handleRoleToggle = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    } else {
      setSelectedRoles(prev => [...prev, role]);
    }
  };

  return (
    <div className="space-y-6" id="ai-copilot-panel">
      {/* 1. Core Target Selector and Top bar */}
      <div className="bg-white border rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-md font-bold text-neutral-850 flex items-center">
              <Sparkles className="h-5 w-5 text-teal-600 mr-1.5 animate-pulse" />
              <span>AI 尽调合规高级助理 (Gemini 驱动芯)</span>
            </h2>
            <p className="text-xs text-neutral-500">
              采用 Gemini 3.5 模型自适应开展非上市企业“红旗预警”评估。选择被调标的，人工智能会自动抽取行业合规底线库。
            </p>
          </div>

          <div>
            <select
              value={selectedProjId}
              onChange={(e) => handleProjectSelectChange(e.target.value)}
              className="text-xs font-bold text-teal-800 bg-teal-50/50 px-3 py-2 rounded-lg border border-teal-100 hover:cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>🎯 载入标的：{p.companyName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature Sub Tabs Controls */}
        <div className="flex border-b border-gray-150 gap-1 pt-2">
          {[
            { id: "checklist", label: "自定义尽调大纲生成", icon: CheckSquare },
            { id: "redflags", label: "财务红旗警戒和机会审计", icon: Activity },
            { id: "interview", label: "穿透性问询访谈大纲", icon: FileQuestion }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`ai-tab-${tab.id}`}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  setErrorMessage("");
                }}
                className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all ${
                  isSel
                    ? "bg-teal-50 text-teal-700 border-t-2 border-teal-600 font-bold"
                    : "text-gray-500 hover:text-gray-800 hover:bg-neutral-50 hover:cursor-pointer"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Unified Content panel Split according to subtabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Input Form Column */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <span className="block text-3xs text-gray-400 font-bold tracking-wider uppercase mb-1">
            诊断目标及参数配置 (随时更改)
          </span>

          {activeSubTab === "checklist" && (
            <div className="space-y-3 font-sans">
              <div>
                <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">被调公司暂定：</label>
                <input
                  type="text"
                  value={companyNameStr}
                  onChange={(e) => setCompanyNameStr(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 text-neutral-800 font-semibold focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">所属特定细分赛道：</label>
                <input
                  type="text"
                  value={industryStr}
                  onChange={(e) => setIndustryStr(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 text-neutral-800 font-semibold focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">核心技术工艺或业务基本面：</label>
                <textarea
                  value={descriptionStr}
                  onChange={(e) => setDescriptionStr(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 h-24 text-neutral-700"
                  placeholder="请输入该公司的主力产品，比如：IGBT功率模块、SiC器件、车规级芯片流片关键攻坚等。"
                />
              </div>

              <button
                id="btn-ai-generate-checklist"
                onClick={handleGenerateChecklist}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 disabled:opacity-60 shadow-md shadow-teal-50 hover:cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>正在挖掘该赛道底线核查指标...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>自动调配行业专属尽调方案 →</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeSubTab === "redflags" && (
            <div className="space-y-3">
              <div>
                <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">财务基本状况摘要（流动变现/账账相符）：</label>
                <textarea
                  value={financialSummaryStr}
                  onChange={(e) => setFinancialSummaryStr(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 h-20 text-neutral-700"
                  placeholder="例如：流动比例紧张，研发高投入导致研发账面大额亏损..."
                />
              </div>
              <div>
                <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">标的核心可辩有形/无形资产（折旧及权证）：</label>
                <input
                  type="text"
                  value={coreAssetsStr}
                  onChange={(e) => setCoreAssetsStr(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 text-neutral-700"
                  placeholder="测试设备、发明专利权属、病例原始数据CRF"
                />
              </div>
              <div>
                <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">短期性债务账面缺口及隐形成本：</label>
                <input
                  type="text"
                  value={coreLiabilitiesStr}
                  onChange={(e) => setCoreLiabilitiesStr(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 text-neutral-700"
                  placeholder="短期应付流片款、政府补助项目返还义务..."
                />
              </div>

              <button
                id="btn-ai-analyze-redflags"
                onClick={handleAnalyzeRedFlags}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 disabled:opacity-60 shadow-md shadow-teal-50 hover:cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>正在进行背对背对赌穿透分析...</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4" />
                    <span>开展资产债务“红旗合规审查” →</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeSubTab === "interview" && (
            <div className="space-y-4">
              <p className="text-2xs text-gray-500 leading-normal">
                对非上市企业开展现场调查，关键是通过各层级负责人的交叉谈话排除“关联利益冲突”及“股份代持假对赌”：
              </p>

              <div className="space-y-2">
                <span className="block text-3xs text-gray-400 font-bold uppercase">选择需安排谈话的人员架构：</span>
                <div className="space-y-2">
                  {["创始人/CEO", "财务总监(CFO)", "技术/研发负责人(CTO)", "合规代表/法务负责人(Legal)"].map(role => {
                    const isSel = selectedRoles.includes(role);
                    return (
                      <label key={role} className="flex items-center space-x-2.5 hover:cursor-pointer p-2.5 bg-gray-50 rounded-lg border border-gray-150 inline-block block">
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => handleRoleToggle(role)}
                          className="h-4 w-4 text-teal-600 rounded border-neutral-300 focus:ring-teal-500"
                        />
                        <span className="text-xs font-medium text-neutral-800">{role}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                id="btn-ai-draft-interview"
                onClick={handleDraftInterview}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 disabled:opacity-60 shadow-md shadow-teal-50 hover:cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>正在提炼各环节突破性问询话术...</span>
                  </>
                ) : (
                  <>
                    <FileQuestion className="h-4 w-4" />
                    <span>提取现场交锋访谈大纲 →</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Generated AI Result Viewer Grid Column */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Error notice */}
          {errorMessage && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-xs flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Loader indicator placeholder */}
          {!loading && !checklistResult && !redFlagsResult && !interviewResult && (
            <div className="bg-white border rounded-xl p-16 text-center text-gray-400 text-xs flex flex-col items-center justify-center space-y-3 font-sans">
              <Compass className="h-12 w-12 text-gray-300 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="space-y-1">
                <p className="font-bold text-gray-700 text-sm">等待激发 AI 合规审计服务</p>
                <p className="text-3xs text-gray-400">请于左侧配置公司信息或直接选择一笔大盘预载标的，点击按钮即可一键完成审计穿透建模</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white border rounded-xl p-16 text-center text-gray-500 text-xs flex flex-col items-center justify-center space-y-4 font-sans">
              <RefreshCw className="h-10 w-10 text-teal-600 animate-spin" />
              <div className="space-y-1">
                <p className="font-bold text-neutral-800 text-sm">正在全力调集 PE 风控大脑...</p>
                <p className="text-3xs text-neutral-400">正在连线 Gemini 超级风控评估机制，细化学术论文、行业资质及资产负债对赌盲点</p>
              </div>
            </div>
          )}

          {/* RESULTS 1: DD Plan Checklist with Apply trigger */}
          {activeSubTab === "checklist" && checklistResult && (
            <div className="bg-white border rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-800 flex items-center">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 mr-1.5" />
                    已为您定制生成 4 大必查合规事项：
                  </h3>
                  <p className="text-3xs text-neutral-400 mt-1">
                    系统根据 {industryStr} 审计习惯自适应配置。清单包含了对于机器无形资产、坏账及代工保管发票重点核对
                  </p>
                </div>

                <button
                  id="btn-apply-ai-plan"
                  onClick={handleApplyChecklistToProject}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-100 hover:cursor-pointer shrink-0 transition-all"
                >
                  一键填充应用至被投资标的中 →
                </button>
              </div>

              <div className="space-y-4">
                {checklistResult.categories.map((cat: any) => (
                  <div key={cat.name} className="space-y-2">
                    <span className="block text-2xs font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded inline-block">
                      {cat.name}
                    </span>
                    <div className="space-y-2 pl-1">
                      {cat.items.map((item: any, i: number) => (
                        <div key={i} className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-150/70 space-y-1">
                          <div className="flex justify-between items-start gap-3">
                            <span className="font-bold text-neutral-800 flex-1">{item.title}</span>
                            <span className={`px-1.5 py-0.5 rounded text-4xs font-bold ${
                              item.importance === '高' ? 'bg-rose-50 text-rose-700' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              重要度: {item.importance}
                            </span>
                          </div>
                          <p className="text-3xs text-neutral-500 leading-normal">{item.description}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            <span className="text-4xs text-gray-400 font-semibold">推荐搜底：</span>
                            {item.sourceDocs.map((doc: string) => (
                              <span key={doc} className="px-1.5 py-0.5 bg-white border rounded text-4xs text-neutral-500">
                                📃 {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULTS 2: Red flags assessment with interactive dial meter */}
          {activeSubTab === "redflags" && redFlagsResult && (
            <div className="bg-white border rounded-xl p-6 shadow-2xs space-y-6">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-extrabold text-neutral-800 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-1.5 animate-pulse" />
                    对赌及坏账红旗穿透诊断底册：
                  </h3>
                  <p className="text-3xs text-neutral-400 mt-0.5">资产负债、表外隐性诉讼及对赌清偿可能对股权结构的影响评定</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-md font-extrabold text-teal-600">{redFlagsResult.feasibilityScore}分</div>
                  <div className="text-4xs text-gray-400">核算可行度估分</div>
                </div>
              </div>

              {/* Progress bar visual indicator */}
              <div className="space-y-1 bg-neutral-50 p-3 rounded-lg border border-neutral-150">
                <div className="flex justify-between text-2xs font-semibold text-neutral-700">
                  <span>投资尽调安全评价等级：</span>
                  <span>
                    {redFlagsResult.feasibilityScore >= 75 ? "✅ 良好 · 建议中度审计后推进" : redFlagsResult.feasibilityScore >= 50 ? "⚠ 警戒 · 资产有折损或对赌隐患，限制推进" : "❌ 极高风险 · 不建议投资"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      redFlagsResult.feasibilityScore >= 75 ? 'bg-emerald-600' : redFlagsResult.feasibilityScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${redFlagsResult.feasibilityScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Red flags listed */}
              <div className="space-y-3">
                <span className="block text-3xs text-gray-400 font-bold uppercase">🚨 严重红旗预警(Red Flags)核对细则：</span>
                {redFlagsResult.redFlags.map((risk: any, i: number) => (
                  <div key={i} className="text-xs bg-rose-50/50 p-3 shadow-3xs rounded-lg border border-rose-200/80 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-rose-900 flex items-center">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600 mr-1 shrink-0" />
                        {risk.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-bold">
                        威胁：{risk.riskLevel}
                      </span>
                    </div>
                    <p className="text-3xs text-neutral-700 leading-normal">
                      <b>直接害处：</b>{risk.impact}
                    </p>
                    <p className="text-3xs text-teal-800 bg-white/60 p-2 rounded border border-teal-150 leading-normal italic">
                      <b>穿透审计指导：</b>{risk.auditAdvice}
                    </p>
                  </div>
                ))}
              </div>

              {/* Opportunities listed */}
              <div className="space-y-3">
                <span className="block text-3xs text-gray-400 font-bold uppercase">🌟 潜在投资优势与技术机会壁垒评估：</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {redFlagsResult.opportunities.map((opp: any, i: number) => (
                    <div key={i} className="bg-emerald-50/45 p-3 rounded-lg border border-emerald-150 text-xs">
                      <span className="font-bold text-emerald-900 block mb-1">{opp.title}</span>
                      <p className="text-3xs text-neutral-600 leading-normal">{opp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* BA Audit instruction advice */}
              <div className="pt-4 border-t border-gray-150 text-neutral-500 text-3xs space-y-1 leading-relaxed">
                <span className="font-bold text-gray-700 block">风控委建议结论：</span>
                <p className="italic bg-neutral-50 p-2.5 rounded text-neutral-600 border border-neutral-100">"{redFlagsResult.summaryAdvice}"</p>
              </div>
            </div>
          )}

          {/* RESULTS 3: Outlines check list interview */}
          {activeSubTab === "interview" && interviewResult && (
            <div className="bg-white border rounded-xl p-6 shadow-2xs space-y-5 animate-fade-in font-sans">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-sm font-extrabold text-neutral-800">
                  拟投资企业现场访谈及攻坚提纲 (定制版)：
                </h3>
                <p className="text-3xs text-neutral-400 mt-1">针锋相对的谈话和问询是识破假对赌、表外借贷的最佳手段。请按角色调阅：</p>
              </div>

              <div className="space-y-4">
                {interviewResult.interviews.map((roleBlock: any, idx: number) => (
                  <div key={idx} className="bg-neutral-50/60 rounded-xl border p-4 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                      <span className="text-xs font-black text-teal-850">
                        访谈对象：{roleBlock.role}
                      </span>
                      <span className="text-3xs text-gray-400">
                        目的：{roleBlock.purpose}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {roleBlock.questions.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="text-xs bg-white p-3 rounded-lg border border-neutral-150 space-y-1.5 shadow-3xs">
                          <div className="font-bold text-neutral-850 flex items-start gap-1">
                            <span className="text-teal-600 shrink-0 select-none">Q{qIdx + 1}:</span>
                            <span className="break-all">{q.question}</span>
                          </div>
                          
                          <div className="bg-teal-50/40 p-2 rounded text-3xs text-teal-800 leading-normal border border-teal-150/45 flex items-start gap-1">
                            <span className="font-bold text-teal-900 shrink-0 uppercase">穿透拆招：</span>
                            <span className="break-all italic">{q.technique}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
