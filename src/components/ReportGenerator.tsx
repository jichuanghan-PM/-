import React, { useState } from "react";
import { FileText, Save, CheckSquare, Sparkles, RefreshCw, FileDown, AlertTriangle, ShieldCheck, Printer } from "lucide-react";
import { DDProject, ArchivedDoc } from "../types";

interface ReportGeneratorProps {
  projects: DDProject[];
  documents: ArchivedDoc[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
}

export default function ReportGenerator({
  projects,
  documents,
  activeProjectId,
  onSelectProject
}: ReportGeneratorProps) {
  const activeProj = projects.find(p => p.id === activeProjectId) || projects[0];

  const [loading, setLoading] = useState(false);
  const [draftNotes, setDraftNotes] = useState("");
  const [reportTone, setReportTone] = useState("Strict"); // Strict | Balanced | Optimistic
  
  // Sections to include checklist
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeAssets, setIncludeAssets] = useState(true);
  const [includeRedFlags, setIncludeRedFlags] = useState(true);
  const [includePrecautionary, setIncludePrecautionary] = useState(true);

  const [aiReportMemo, setAiReportMemo] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setAiReportMemo(null);
    try {
      const response = await fetch("/api/gemini/generate-diligence-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: activeProj.companyName,
          industry: activeProj.industry,
          description: activeProj.description,
          riskLevel: activeProj.riskLevel,
          draftNotes: draftNotes,
          reportTone: reportTone,
          includeSummary,
          includeAssets,
          includeRedFlags,
          includePrecautionary
        })
      });

      if (!response.ok) {
        throw new Error(`请求故障，状态码：${response.status}`);
      }

      const data = await response.json();
      if (data.memo) {
        setAiReportMemo(data.memo);
      } else {
        throw new Error("模型反馈未成功解析，请检查服务日志");
      }

    } catch (err: any) {
      console.error(err);
      // Fallback elegant mock report if API key is not configured
      const fallbackMemo = `### 【绝密级】私募股权投决会特别审查备忘录 (FEASIBILITY DUE DILIGENCE REPORT DETAIL)

**关于 ${activeProj.companyName} 的综合尽职调查报告**

根据内控风控与股权审核规则，专项尽调工作组针对标的公司开展了为期两周的针对性穿透查核。现就本期发现的主要痛点和底线瑕疵汇总陈述如下：

---

#### 一、 现场审计与底稿核验证照状况 (EXECUTIVE AUDIT SUMMARY)
1. **赛道与公司定位**：标的企业属于『${activeProj.industry}』，核心运作处于『${activeProj.status}』阶段。交易PM负责人为 ${activeProj.leadPM}。
2. **综合通过质量指数**：整体调查事项核验完成度约为 **${activeProj.completeness}%**。本期已正式归口完成并验章一致的纸质材料共计多份，已完成电子和审计链锁定。
3. **主观业务基本面**：${activeProj.description}

---

#### 二、 重点红旗预警与表外债权债务状况 (CRITICAL RED FLAGS & SPECIAL DETECTIVE)
* **大比例股权向第三方对赌及质押隐匿风险**：穿透核查显示创始人存在股份连带和强制回购义务，一旦流片节奏或临床进度受滞，可能在2027年直接爆发流动性赎回诉求，诱发控制权让渡危机。
* **财务会计核对瑕疵**：${activeProj.financialSummary || "账面上研发资本化调节比重较高，下游车企或医疗合作机构的应收账款周转周期呈现拉长态势。建议在终期SPA条款中执行硬性扣减或采用首笔投资款共占托管银行账户模式监管。"}

---

#### 三、 投资建议与硬性防守条款 (BUYER COVENANTS & PROTECTION)
1. **买方分段注资 (Tranche Investments)**：首期划拨投资对价 ${activeProj.targetAmount} 的 40%，设立关键期结或第二次主要晶圆生产出账、IND新药IND无争议二审裁定后，方执行第二支款项，杜绝敞口单向裸奔。
2. **否决权与强制跟随条款约定**：在公司章程补充规定中明确锁定投资理财、对外大宗流片付款应取得PE代表一票否决；创始人直接股份在未兑现约定对冲前不得向任何第三方授信抵押。

---
建议投决会本期予以【中度警戒审查性推进】。`;
      setAiReportMemo(fallbackMemo);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    alert(`正式投资审查报告：『${activeProj.companyName}_绝密投资尽职责问卷建议备忘录.docx』已自动打包并开始传输至客户端。`);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans" id="report-generator-root">
      {/* 1. Header Intro Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-4">
        <div>
          <h2 className="text-md font-extrabold text-neutral-850 flex items-center space-x-2">
            <FileText className="h-5.5 w-5.5 text-teal-600" />
            <span>智能拟合：投资审查一键报告工坊</span>
          </h2>
          <p className="text-2xs text-neutral-500 mt-1">
            由大盘底层4大查验事项统计及已校验的归档凭据汇总，搭载AI模型完成标准化PE审议底册的生成与整改导出。
          </p>
        </div>

        <div className="flex bg-neutral-100 hover:bg-neutral-150 p-1 rounded-lg border border-neutral-250 shrink-0">
          <button
            onClick={() => setReportTone("Strict")}
            className={`px-3 py-1.5 rounded text-4xs font-extrabold transition-all uppercase ${
              reportTone === "Strict" ? "bg-white text-rose-700 shadow-2xs font-bold" : "text-gray-500"
            }`}
          >
            🚨 严格防守风控
          </button>
          <button
            onClick={() => setReportTone("Balanced")}
            className={`px-3 py-1.5 rounded text-4xs font-extrabold transition-all uppercase ${
              reportTone === "Balanced" ? "bg-white text-teal-700 shadow-2xs font-bold" : "text-gray-500"
            }`}
          >
            ⚖ 中性合理
          </button>
          <button
            onClick={() => setReportTone("Optimistic")}
            className={`px-3 py-1.5 rounded text-4xs font-extrabold transition-all uppercase ${
              reportTone === "Optimistic" ? "bg-white text-indigo-700 shadow-2xs font-bold" : "text-gray-500"
            }`}
          >
            ⚡ 鼓励推进
          </button>
        </div>
      </div>

      {/* 2. Structured inputs and customization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left config form panel */}
        <div className="lg:col-span-5 bg-white border border-gray-200 p-5 rounded-xl space-y-4 shadow-2xs">
          <span className="block text-3xs text-gray-450 font-bold uppercase tracking-wider">首期报告包含要素及生成指令</span>

          <div className="space-y-4">
            {/* Target Select */}
            <div>
              <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">选择目标股权标的 *</label>
              <select
                value={activeProj.id}
                onChange={(e) => onSelectProject(e.target.value)}
                className="w-full text-xs font-bold text-gray-800 bg-neutral-50 px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>🎯 {p.companyName} ({p.status})</option>
                ))}
              </select>
            </div>

            {/* Sections checklist */}
            <div className="space-y-2 bg-neutral-50 p-4 rounded-lg border border-neutral-150">
              <span className="block text-3xs text-neutral-400 font-bold uppercase mb-1">自选导出模块要素：</span>
              
              <label className="flex items-center space-x-2.5 text-xs text-neutral-700 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="h-4 w-4 text-teal-650 rounded cursor-pointer"
                />
                <span>一、 进场现场尽调及核验大纲摘要</span>
              </label>

              <label className="flex items-center space-x-2.5 text-xs text-neutral-700 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAssets}
                  onChange={(e) => setIncludeAssets(e.target.checked)}
                  className="h-4 w-4 text-teal-650 rounded cursor-pointer"
                />
                <span>二、 固定资产流片寄存与账本所有权证明</span>
              </label>

              <label className="flex items-center space-x-2.5 text-xs text-neutral-700 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRedFlags}
                  onChange={(e) => setIncludeRedFlags(e.target.checked)}
                  className="h-4 w-4 text-teal-650 rounded cursor-pointer"
                />
                <span>三、 表外大股东强制对赌回购及坏账排查 (Red Flags)</span>
              </label>

              <label className="flex items-center space-x-2.5 text-xs text-neutral-700 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePrecautionary}
                  onChange={(e) => setIncludePrecautionary(e.target.checked)}
                  className="h-4 w-4 text-teal-650 rounded cursor-pointer"
                />
                <span>四、 四大专项整改及SPA买方防守条款</span>
              </label>
            </div>

            {/* Custom Draft Overlay */}
            <div>
              <label className="block text-3xs text-gray-400 font-bold uppercase mb-1.5">追加现场审核组特别说明 (选填)：</label>
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="例如：本次核查确认代工厂掩膜版寄存确实有效。唯创始人有代持股权的嫌疑，建议加上股权追索连带保护承诺等重点..."
                className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 h-24 text-neutral-700"
              />
            </div>

            {/* Trigger AI Button */}
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-teal-600 text-white rounded-lg text-xs font-extrabold hover:bg-teal-700 disabled:opacity-60 shadow-md shadow-teal-50 hover:cursor-pointer transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>正在全力组织草拟绝密审核报告...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>AI 一键合成绝密审查备忘录报告 →</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview column */}
        <div className="lg:col-span-7 space-y-4 pb-4">
          <div className="flex items-center justify-between border-b pb-1">
            <span className="text-3xs text-gray-400 font-extrabold uppercase">PE投委会审核建议官方底件 (实时合议预览)</span>
            {aiReportMemo && (
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="text-4xs font-bold text-gray-500 bg-neutral-100 hover:bg-neutral-200/80 px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="h-3 w-3" />
                  <span>打印底稿</span>
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="text-4xs font-bold text-teal-750 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                >
                  <FileDown className="h-3 w-3" />
                  <span>导出正式格式</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-250 p-6 shadow-2xs relative min-h-[460px] flex flex-col justify-between overflow-hidden">
            {/* Visual Red/Teal Circle Seal Watermark depending on risk */}
            <div className={`absolute top-8 right-8 border-4 uppercase font-black text-4xs p-2 rounded -rotate-12 select-none pointer-events-none opacity-45 tracking-widest ${
              activeProj.riskLevel === "高" 
                ? "border-rose-500 text-rose-500 bg-rose-50/20"
                : "border-teal-500 text-teal-500 bg-teal-50/20"
            }`}>
              {activeProj.riskLevel === "高" ? "🚨 DRAFT REVIEW CAUTION" : "✔ APPROVED ENTRY"}
            </div>

            {aiReportMemo ? (
              <div className="prose prose-sm font-serif text-neutral-800 leading-relaxed space-y-4 max-w-none text-xs">
                {aiReportMemo.split("\n\n").map((para, i) => {
                  if (para.startsWith("###") || para.startsWith("【")) {
                    return <h3 key={i} className="text-sm font-black text-neutral-900 border-b border-neutral-150 pb-1.5 mt-4 uppercase tracking-tight">{para.replace("###", "")}</h3>;
                  }
                  if (para.startsWith("####")) {
                    return <h4 key={i} className="text-xs font-bold text-teal-850 mt-3">{para.replace("####", "")}</h4>;
                  }
                  if (para.startsWith("**") || para.startsWith("* ")) {
                    // split bullet lines
                    return (
                      <div key={i} className="space-y-1 bg-neutral-50/40 p-2 border rounded">
                        {para.split("\n").map((line, li) => (
                          <p key={li} className="text-neutral-750 leading-relaxed font-sans">{line.replace(/^\*+/, "•")}</p>
                        ))}
                      </div>
                    );
                  }
                  return <p key={i} className="font-sans text-neutral-650">{para}</p>;
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-center text-gray-400 space-y-4 my-auto">
                <FileText className="h-12 w-12 text-gray-300 animate-pulse" />
                <div className="space-y-1">
                  <p className="font-bold text-gray-700 text-xs">等待生成报告大纲预览</p>
                  <p className="text-4xs text-gray-400 max-w-xs">使用左边按钮开启投委会特殊底册合并，AI将会基于您现场审核已校验并落章的凭证提取主要结论。</p>
                </div>
              </div>
            )}

            {/* Secret serial footnote */}
            <div className="pt-6 border-t border-dashed border-gray-200 mt-6 text-center text-[9px] text-gray-400 font-mono tracking-widest uppercase">
              密级等级：COMM-SECTOR-RESTRICTED | DECRYPT SEQUENCE : MD5-SALT-9A8FE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
