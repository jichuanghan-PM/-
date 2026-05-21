import React, { useState } from "react";
import { Folder, Search, CheckCircle, Clock, ShieldCheck, Download, Plus, Trash, FileSpreadsheet, FileText, FileDown, Eye } from "lucide-react";
import { ArchivedDoc, DDProject } from "../types";

interface DocumentArchiveProps {
  documents: ArchivedDoc[];
  projects: DDProject[];
  onVerifyDoc: (docId: string) => void;
  onDeleteDoc: (docId: string) => void;
  onAddManualDoc: (projId: string, name: string, category: string, size: string, uploader: string) => void;
}

export default function DocumentArchive({
  documents,
  projects,
  onVerifyDoc,
  onDeleteDoc,
  onAddManualDoc
}: DocumentArchiveProps) {
  // Filters state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Manual Add Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualProjId, setManualProjId] = useState(projects[0]?.id || "");
  const [manualName, setManualName] = useState("");
  const [manualCat, setManualCat] = useState<any>("资产负债");
  const [manualSize, setManualSize] = useState("1.8 MB");
  const [manualUploader, setManualUploader] = useState("投资助理-小刘");

  // Report Memo Generator states
  const [showReportProjId, setShowReportProjId] = useState<string | null>(null);

  const categories = [
    { id: "资产负债", name: "资产与负债底稿" },
    { id: "经营财务", name: "经营与财务账目" },
    { id: "法律合规", name: "法律关系与章程" },
    { id: "风控与报告", name: "风控分析与报告" },
    { id: "其他", name: "其他配套资料" }
  ];

  // Filtering Logic
  const filteredDocs = documents.filter(doc => {
    const matchProj = selectedProjectId === "all" || doc.projectId === selectedProjectId;
    const matchCat = selectedCategory === "all" || doc.category === selectedCategory;
    const matchSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchProj && matchCat && matchSearch;
  });

  const getProjName = (id: string) => {
    return projects.find(p => p.id === id)?.companyName || "通用项目";
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      alert("请输入文件名称！");
      return;
    }
    onAddManualDoc(
      manualProjId,
      manualName.trim() + (manualName.includes(".") ? "" : ".pdf"),
      manualCat,
      manualSize,
      manualUploader
    );
    setManualName("");
    setShowAddForm(false);
  };

  // Compile full Memo context for the Modal view
  const activeReportProj = projects.find(p => p.id === showReportProjId);
  const matchingDocsForReport = documents.filter(d => d.projectId === showReportProjId);

  return (
    <div className="space-y-6 animate-fade-in" id="archive-section">
      {/* 1. Header Toolbar with Add CTA and Report Memo Creator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-md font-bold text-neutral-800 flex items-center space-x-1.5">
            <Folder className="h-5 w-5 text-teal-650" />
            <span>尽调标的业务资料归档台账</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            非上市公司股权投资需要严格实现纸质、原件复印书的二级穿透电子化存档，避免表外对赌陷阱。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Memo generator trigger */}
          <select
            onChange={(e) => {
              if (e.target.value !== "") {
                setShowReportProjId(e.target.value);
                e.target.value = ""; // reset
              }
            }}
            defaultValue=""
            className="text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-2 rounded-lg hover:cursor-pointer transition-colors"
          >
            <option value="" disabled>📊 生成并导出尽调总备忘录...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.companyName}</option>
            ))}
          </select>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 px-3.5 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold shadow-2xs hover:bg-teal-700 hover:cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>手动录入归档底稿</span>
          </button>
        </div>
      </div>

      {/* 2. Structured Filter Panel */}
      <div className="bg-white border rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Project select */}
        <div className="space-y-1">
          <label className="block text-3xs text-gray-400 font-bold uppercase">标的企业筛选</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full text-xs bg-neutral-50 rounded-lg border border-neutral-200 p-2 focus:outline-none focus:ring-1 focus:ring-teal-500 hover:cursor-pointer font-medium text-neutral-700"
          >
            <option value="all">📁 全部拟投资标的公司 ({projects.length})</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.companyName}</option>
            ))}
          </select>
        </div>

        {/* Directory select */}
        <div className="space-y-1">
          <label className="block text-3xs text-gray-400 font-bold uppercase">归档分类子目录</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs bg-neutral-50 rounded-lg border border-neutral-200 p-2 focus:outline-none focus:ring-1 focus:ring-teal-500 hover:cursor-pointer font-medium text-neutral-700"
          >
            <option value="all">📂 全部合规归档子集目录</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Document string search */}
        <div className="space-y-1">
          <label className="block text-3xs text-gray-400 font-bold uppercase">底稿文档名称检索</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜寻底稿名称、批件、合同内容..."
              className="w-full text-xs bg-neutral-50 rounded-lg border border-neutral-200 p-2 pl-8 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-neutral-700"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 3. Document Files Table with Verification Control */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-55 border-b border-neutral-100 text-neutral-400 text-3xs uppercase font-extrabold tracking-wider">
                <th className="py-3 px-4">文档名称/格式</th>
                <th className="py-3 px-4">归属标的企业</th>
                <th className="py-3 px-4 text-center">子目录分类</th>
                <th className="py-3 px-3">上传进度/体积</th>
                <th className="py-3 px-4">验印审核状态</th>
                <th className="py-3 px-4 text-center">操作指令</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    未查获相关过滤条件下的归档材料凭证。请下场核对底稿后再一键归档。
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isXls = doc.fileName.includes(".xlsx") || doc.fileName.includes(".xls");
                  const isPdf = doc.fileName.includes(".pdf");

                  return (
                    <tr key={doc.id} className="hover:bg-neutral-50/50 transition-colors">
                      {/* Document icon & Name */}
                      <td className="py-3.5 px-4 font-medium text-neutral-850">
                        <div className="flex items-center space-x-2">
                          {isXls ? (
                            <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                          ) : (
                            <FileText className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                          )}
                          <div className="space-y-0.5">
                            <span className="font-bold block text-neutral-800 break-all">{doc.fileName}</span>
                            {doc.notes && <span className="text-3xs text-neutral-400 block line-clamp-1 italic">{doc.notes}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Associated Company */}
                      <td className="py-3.5 px-4 text-neutral-600 font-semibold max-w-[150px] truncate">
                        {getProjName(doc.projectId)}
                      </td>

                      {/* Directory level category badge */}
                      <td className="py-3.5 px-4 text-center max-w-[110px] truncate">
                        <span className="inline-flex px-2 py-0.5 rounded text-3xl font-medium bg-neutral-100 border border-neutral-200">
                          {doc.category}
                        </span>
                      </td>

                      {/* Date / size */}
                      <td className="py-3.5 px-3 text-neutral-500 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-neutral-300" />
                          <span>{doc.uploadDate}</span>
                        </div>
                        <div className="text-3xs text-neutral-400 mt-0.5">{doc.size} · {doc.uploader}</div>
                      </td>

                      {/* Back-to-back sign inspection status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {doc.isVerified ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-250 font-semibold text-3xs">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span>✔ 验印审计一致</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-250 text-3xs font-medium">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span>未核验印章真伪</span>
                          </span>
                        )}
                      </td>

                      {/* Audit operations */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center text-xs space-x-2">
                        <button
                          onClick={() => onVerifyDoc(doc.id)}
                          className={`px-2 py-1 rounded text-3xs font-bold transition-all ${
                            doc.isVerified
                              ? "bg-neutral-100 text-neutral-500 hover:bg-neutral-200/65 hover:cursor-pointer"
                              : "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 hover:cursor-pointer"
                          }`}
                        >
                          {doc.isVerified ? "重置不通过" : "✔ 校验加盖印章"}
                        </button>
                        <button
                          onClick={() => onDeleteDoc(doc.id)}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded-sm hover:cursor-pointer inline-block"
                          title="物理移出归档"
                        >
                          <Trash className="h-3.5 w-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Manual archive upload form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-neutral-100 animate-fade-in font-sans">
            <h3 className="text-md font-bold text-neutral-800 mb-4">手动补充登记档案件</h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">关联哪一家被投非上市标的？</label>
                <select
                  value={manualProjId}
                  onChange={(e) => setManualProjId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 font-medium"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">物理底稿文件及书面名称：</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="例如：晶圆供货发票账目单_2025Q4"
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">子目录分类：</label>
                  <select
                    value={manualCat}
                    onChange={(e) => setManualCat(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 font-medium"
                  >
                    <option value="资产负债">资产负债底稿</option>
                    <option value="经营财务">经营财务账目</option>
                    <option value="法律合规">法律合规章程</option>
                    <option value="风控与报告">风控专报文件</option>
                    <option value="其他">其他外来备忘</option>
                  </select>
                </div>
                <div>
                  <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">文档占用空间体积：</label>
                  <input
                    type="text"
                    value={manualSize}
                    onChange={(e) => setManualSize(e.target.value)}
                    placeholder="2.4 MB"
                    className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-3xs text-gray-400 font-bold uppercase mb-1">调阅人及经办职员签名：</label>
                <input
                  type="text"
                  value={manualUploader}
                  onChange={(e) => setManualUploader(e.target.value)}
                  placeholder="投资总监-陈德胜"
                  className="w-full text-xs rounded-lg border border-neutral-200 p-2.5 bg-neutral-50 font-medium"
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
                  登记并归档
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Formatted PE Due Diligence Investment Memo Previewer */}
      {showReportProjId && activeReportProj && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col justify-between overflow-hidden border border-neutral-150 font-sans">
            {/* Header info */}
            <div className="bg-neutral-900 text-white p-5 flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  PE-DD Committee Secret Memo Report
                </span>
                <h3 className="text-md font-bold tracking-tight">尽职调查及拟投资项目建议备忘录 (Draft)</h3>
              </div>
              <button
                onClick={() => setShowReportProjId(null)}
                className="text-white/60 hover:text-white px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-lg hover:cursor-pointer"
              >
                关闭预览
              </button>
            </div>

            {/* Content body layout mimics official PE memo paper */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6 text-neutral-800 bg-neutral-50/50 leading-relaxed font-sans scrollbar-thin">
              <div className="bg-white p-6 rounded-lg border border-neutral-200/80 shadow-xs space-y-4 max-w-3xl mx-auto border-t-4 border-t-amber-600 relative">
                {/* Visual watermark */}
                <span className="absolute top-4 right-4 text-3xs font-extrabold uppercase p-1.5 border border-amber-600 text-amber-600 tracking-widest rotate-6 transform opacity-40">
                  绝密 · 投决会备忘
                </span>

                {/* Company title and header */}
                <div className="text-center space-y-1 pb-4 border-b border-neutral-200">
                  <h1 className="text-lg font-black tracking-tight">{activeReportProj.companyName}</h1>
                  <h2 className="text-xs font-extrabold text-neutral-500 uppercase">{activeReportProj.industry} · 并购/PE投资建议草本大纲</h2>
                </div>

                {/* Grid meta info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-2xs pt-2">
                  <div>
                    <span className="text-gray-400 font-medium">项目级别：</span>
                    <span className="font-extrabold text-neutral-700">{activeReportProj.riskLevel === "高" ? "高风险 · 重大攻坚标的" : "常规风险 · 优质标的"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">领投PM：</span>
                    <span className="font-extrabold text-neutral-700">{activeReportProj.leadPM}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">拟投资金额：</span>
                    <span className="font-bold text-teal-600">{activeReportProj.targetAmount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">尽调完成率：</span>
                    <span className="font-bold text-amber-600">{activeReportProj.completeness}%</span>
                  </div>
                </div>

                {/* Paper Block 1: Fund background */}
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider bg-neutral-100 p-1.5 rounded">
                    一、 投资标的核心基本面背景 (非上市状态说明)
                  </h3>
                  <p className="text-xs text-neutral-600 pt-1 leading-relaxed">
                    {activeReportProj.description}
                  </p>
                </div>

                {/* Paper Block 2: Financial/Assets items from survey inputs */}
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider bg-neutral-100 p-1.5 rounded">
                    二、 重点资产名录及资产负债合规分析
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1.5">
                    <div className="bg-neutral-50/50 p-2.5 rounded border border-neutral-100">
                      <span className="font-bold text-gray-700 text-2xs block">核定核心资产构成：</span>
                      <p className="text-neutral-500 text-2xs mt-1 leading-normal">{activeReportProj.coreAssets || "未提取或无重资本资产，采取核心Saas合同池方式确权。"}</p>
                    </div>
                    <div className="bg-neutral-50/50 p-2.5 rounded border border-neutral-100">
                      <span className="font-bold text-gray-700 text-2xs block">审核核定负债/对赌及对冲隐患：</span>
                      <p className="text-neutral-500 text-2xs mt-1 leading-normal">{activeReportProj.coreLiabilities || "账本表内债务状况相对干净，重在创始人回购对赌履约能力督查。"}</p>
                    </div>
                  </div>
                  <div className="bg-amber-100/35 border border-amber-200/50 rounded p-2.5 text-2xs text-amber-900 leading-normal font-sans pt-1">
                    <b>财务底牌预估说明：</b>{activeReportProj.financialSummary || "无重大财务不良坏账隐患。"}
                  </div>
                </div>

                {/* Paper Block 3: Executed Task Lists summary */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider bg-neutral-100 p-1.5 rounded">
                    三、 4大部分现场尽职调查执行核定追踪大纲
                  </h3>
                  <div className="divide-y divide-neutral-150 text-2xs">
                    {activeReportProj.checklists.map(item => (
                      <div key={item.id} className="py-2.5 space-y-1 grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-3 font-bold text-gray-655 flex items-center">
                          <span>{item.category}:</span>
                        </div>
                        <div className="md:col-span-6">
                          <span className="font-extrabold text-neutral-800 block">{item.title}</span>
                          {item.meetingNotes && (
                            <span className="text-neutral-400 block mt-0.5 max-w-sm line-clamp-1 italic">
                              "{item.meetingNotes}"
                            </span>
                          )}
                        </div>
                        <div className="md:col-span-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-4xs font-bold ${
                            item.status === '已审核' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paper Block 4: Archived Document Checklist matching state */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider bg-neutral-100 p-1.5 rounded">
                    四、 已校验归档审计凭证目录清单 ({matchingDocsForReport.length})
                  </h3>
                  {matchingDocsForReport.length === 0 ? (
                    <p className="text-3xs text-neutral-400 italic">暂未调阅任何经核章的合规凭本。</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-3xs font-sans">
                      {matchingDocsForReport.map(doc => (
                        <div key={doc.id} className="flex justify-between items-center p-2 bg-white border rounded">
                          <span className="font-bold text-neutral-700">{doc.fileName}</span>
                          <span className={`px-1.5 py-0.5 rounded text-4xs font-bold ${
                            doc.isVerified ? "bg-emerald-50/60 text-emerald-800" : "bg-neutral-100 text-neutral-500"
                          }`}>
                            {doc.isVerified ? "盖章校验通过" : "等待审章"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Report disclaimer and footer */}
                <div className="pt-6 border-t border-neutral-200 text-center text-3xs text-neutral-400 space-y-1 uppercase tracking-tight">
                  <p>机密材料 · 严禁复制 · 仅供内部投决会委员及风控负责人决策参考</p>
                  <p>私募股权管理数字化底盘支持系统 @ 2026-05-21 02:53</p>
                </div>

              </div>
            </div>

            {/* Trigger download mock */}
            <div className="bg-neutral-900 p-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-3xs text-white/40 font-mono">MD5签名: 8f9a2e4b3c0d8f7e6a5b4c3d2e1f0a9b</span>
              <button
                onClick={() => {
                  alert(`尽调备忘录「${activeReportProj.companyName}尽调备忘录.pdf」打包并模拟导出本地磁盘。`);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-500 shadow-sm hover:cursor-pointer"
              >
                <FileDown className="h-4 w-4" />
                <span>打包导出 PDF 底稿正本</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
