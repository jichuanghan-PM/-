import React, { useState } from "react";
import { ShieldCheck, HelpCircle, FileCheck, CheckCircle, RefreshCcw, FolderOpen, AlertCircle, Sparkles, MessageSquare } from "lucide-react";
import { DDProject, ChecklistItem } from "../types";

interface SpecialChecksProps {
  projects: DDProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onUpdateProjectChecklist: (projId: string, itemId: string, updatedFields: Partial<ChecklistItem>) => void;
  onSimulateArchiveDoc: (projId: string, fileName: string, category: string, notes: string) => void;
}

export default function SpecialChecks({
  projects,
  activeProjectId,
  onSelectProject,
  onUpdateProjectChecklist,
  onSimulateArchiveDoc
}: SpecialChecksProps) {
  const activeProj = projects.find(p => p.id === activeProjectId) || projects[0];

  // The 5 Special Due Diligence Areas requested by the user
  const SPECIAL_AREAS = [
    { id: "assets", name: "1. 资产与负债专项", categoryMapping: "资产和负债情况", desc: "实物设备抽查权属证实、测试估值比对、长期与短期债务追索、知识产权流片寄存状态穿透。" },
    { id: "finance", name: "2. 经营与财务专项", categoryMapping: "经营和财务情况", desc: "大额关联方收入均摊检测、递延分摊操纵校验、应收款周转坏账率重测、大客户月度ARR日志校准。" },
    { id: "legal", name: "3. 法律关系与公司章程专项", categoryMapping: "法律关系", desc: "历史股权变更章程修正审核、高管离职前司清白竞业备忘核验、多级对外质押与代持问题摸排。" },
    { id: "risk", name: "4. 退出机会与潜在综合风险专项", categoryMapping: "机会与潜在风险", desc: "技术代际替代周期评估、大厂产能对流片节奏制约性、投资对齐回报退出红线上限核定。" },
    { id: "repurchase", name: "5. 供应链穿透与对赌回购专项", categoryMapping: "对赌协议及供应链", desc: "穿透创始人强制回购限期（如若2027未能成功触发IPO的偿付包揽压力）、大宗晶圆及外包CRO资金流水对账。" }
  ];

  const [activeAreaId, setActiveAreaId] = useState("assets");
  const activeArea = SPECIAL_AREAS.find(a => a.id === activeAreaId)!;

  // Modals / Inputs
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [meetingNotesTemp, setMeetingNotesTemp] = useState("");
  const [archivingItemId, setArchivingItemId] = useState<string | null>(null);
  const [selectedDocsToUpload, setSelectedDocsToUpload] = useState<string[]>([]);
  const [customDocName, setCustomDocName] = useState("");

  // Get active checklists for selected area. If "repurchase" mapping doesn't exist, we look in normal checklists 
  // and match against typical terms like "对赌", "回购", "晶圆", "供应链", or return default sample items.
  let activeItems = activeProj.checklists.filter(item => {
    if (activeArea.id === "repurchase") {
      return item.title.includes("对赌") || item.title.includes("回购") || item.title.includes("供应链") || item.description.includes("代持") || item.category === "机会与潜在风险";
    }
    return item.category === activeArea.categoryMapping;
  });

  // Fallback for custom or empty items in specific areas to make it high-fidelity
  if (activeItems.length === 0) {
    if (activeArea.id === "repurchase") {
      // Find items in Legal or Risk that mentions đối赌 or repurchase
      activeItems = activeProj.checklists.filter(i => i.title.includes("对赌") || i.title.includes("回购") || i.description.includes("代偿") || i.description.includes("流片"));
      if (activeItems.length === 0) {
        // Create an on-the-fly checklist item for custom project so view is not empty
        activeItems = [{
          id: `rep_fallback_${activeProj.id}`,
          category: "机会与潜在风险",
          title: "穿透查核创始人签订的表外大股东股权差额补足与连带强制回购条款",
          description: "调调大股东历史股权交易意向书、质押及代持账底，预估后续流片失利后企业估值触发回购协议的财务熔断压力。",
          importance: "高",
          status: "收集资料中",
          assignee: "项目投资经理" + activeProj.leadPM,
          sourceDocs: ["大股东历史对赌协议及章程补充修正", "股权回购连带担保底档"],
          uploadedDocs: []
        }];
      }
    } else {
      activeItems = [{
        id: `fall_${activeArea.id}`,
        category: "其它核心方向" as any,
        title: `特定专项查核：${activeArea.name} 自助梳理排查`,
        description: `针对标的企业「${activeArea.name}」相关的资质凭证与大批流水进行现场穿透校核，确保财务无漏洞隐患。`,
        importance: "中",
        status: "未开始",
        assignee: activeProj.leadPM,
        sourceDocs: ["对应要素发票流水", "行业自查报告文档"],
        uploadedDocs: []
      }];
    }
  }

  const handleOpenNotes = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setMeetingNotesTemp(item.meetingNotes || "");
  };

  const handleSaveNotes = () => {
    if (editingItemId) {
      onUpdateProjectChecklist(activeProj.id, editingItemId, { meetingNotes: meetingNotesTemp });
      setEditingItemId(null);
    }
  };

  const handleOpenArchiver = (item: ChecklistItem) => {
    setArchivingItemId(item.id);
    setSelectedDocsToUpload([]);
    setCustomDocName("");
  };

  const handleConfirmArchive = () => {
    if (!archivingItemId) return;
    const item = activeProj.checklists.find(i => i.id === archivingItemId) || activeItems.find(i => i.id === archivingItemId);
    if (!item) return;

    const docsToArchive = [...selectedDocsToUpload];
    if (customDocName.trim()) {
      docsToArchive.push(customDocName.trim() + (customDocName.includes(".") ? "" : ".pdf"));
    }

    if (docsToArchive.length === 0) {
      alert("请至少勾选需核定的标准底稿或在下方输入一份补充材料名称！");
      return;
    }

    let archiveCat: "资产负债" | "经营财务" | "法律合规" | "风控与报告" | "其他" = "其他";
    if (activeAreaId === "assets") archiveCat = "资产负债";
    else if (activeAreaId === "finance") archiveCat = "经营财务";
    else if (activeAreaId === "legal") archiveCat = "法律合规";
    else if (activeAreaId === "risk") archiveCat = "风控与报告";
    else if (activeAreaId === "repurchase") archiveCat = "风控与报告";

    docsToArchive.forEach(fileName => {
      onSimulateArchiveDoc(
        activeProj.id,
        fileName,
        archiveCat,
        `通过「${activeArea.name}」专项行动（原事项：${item.title}）查验后穿透归档。`
      );
    });

    const currentUploaded = item.uploadedDocs || [];
    const newUploaded = Array.from(new Set([...currentUploaded, ...docsToArchive]));
    onUpdateProjectChecklist(activeProj.id, archivingItemId, {
      uploadedDocs: newUploaded,
      status: "已收集待审计"
    });

    setArchivingItemId(null);
    alert(`归档成功！${docsToArchive.length}份原始材料契证已存入【尽调文库】。核查事项状态已切换为[已收集待审计]。`);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="five-special-checks-root">
      {/* 1. Selector ribbon */}
      <div className="bg-white border rounded-xl p-4 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="h-5.5 w-5.5 text-teal-600 shrink-0" />
          <div>
            <span className="text-3xs text-gray-400 font-bold uppercase tracking-wider block">专项穿透审计公司标的选择：</span>
            <div className="flex items-center space-x-2">
              <select
                value={activeProj.id}
                onChange={(e) => onSelectProject(e.target.value)}
                className="text-xs font-extrabold text-gray-800 bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-gray-250 focus:outline-none focus:ring-1 focus:ring-teal-500 hover:cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.companyName}</option>
                ))}
              </select>
              <span className="text-3xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold border border-teal-200/50">
                赛道：{activeProj.industry}
              </span>
            </div>
          </div>
        </div>

        <div className="text-3xs text-neutral-400 bg-neutral-50 p-2 rounded border border-neutral-100 flex items-center max-w-sm">
          <AlertCircle className="h-4 w-4 text-amber-500 mr-1.5 shrink-0" />
          <span>针对非上市标的非标准化账目及隐形抽逃对赌特别设计的5项专线穿透工作台。</span>
        </div>
      </div>

      {/* 2. Main split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left menu column */}
        <div className="lg:col-span-1 space-y-3">
          <span className="block text-3xs text-gray-400 font-bold tracking-wider uppercase">
            五大专项现场尽调核查方向
          </span>

          <div className="flex flex-col gap-2">
            {SPECIAL_AREAS.map(area => {
              const isActive = activeAreaId === area.id;
              return (
                <button
                  key={area.id}
                  onClick={() => setActiveAreaId(area.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? "bg-teal-600 text-white border-teal-650 shadow-sm"
                      : "bg-white text-neutral-700 border-gray-200/70 hover:bg-gray-50 hover:cursor-pointer"
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{area.name}</span>
                  <span className={`text-[10px] mt-1 line-clamp-1 ${isActive ? "text-teal-100" : "text-gray-400"}`}>
                    项目主审负责人: {activeProj.leadPM}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-100 space-y-2 text-3xs text-teal-800 leading-relaxed">
            <span className="font-bold block text-teal-900 flex items-center">
              <Sparkles className="h-3 w-3 mr-1 text-amber-500 animate-pulse" />
              穿透底线合规准则：
            </span>
            <p>
              由于缺乏公众核准约束，高新技术及医药核电标的常伴随“流片掩膜所属权代持”或“临床阶段数据造假”，必须利用第5项<b>供应链与对赌专项核查</b>强制调取上游银行付息流水进行多边印证。
            </p>
          </div>
        </div>

        {/* Right items listing column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 text-white rounded-xl p-4 shadow-sm font-sans">
            <h4 className="text-xs font-extrabold text-teal-300 uppercase tracking-widest">
              专项：{activeArea.name}
            </h4>
            <p className="text-2xs text-white/80 mt-1 lines-clamp-2 leading-relaxed">
              🔍 <b>核心核查要素</b>：{activeArea.desc}
            </p>
          </div>

          <div className="space-y-4">
            {activeItems.map((item, idx) => {
              const colorBadge = item.importance === "高" ? "bg-rose-50 text-rose-800 border-rose-200" : "bg-neutral-105 bg-gray-50 border-gray-200";
              return (
                <div key={item.id} className="bg-white border rounded-xl p-5 shadow-2xs space-y-4 font-sans">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-4xs font-bold border ${colorBadge}`}>
                          重要度：{item.importance}
                        </span>
                        <span className="text-4xs text-neutral-400 font-bold uppercase">归口：{item.assignee}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-neutral-850 leading-snug">{item.title}</h4>
                    </div>

                    <select
                      value={item.status}
                      onChange={(e) => onUpdateProjectChecklist(activeProj.id, item.id, { status: e.target.value as any })}
                      className="text-3xs font-extrabold text-gray-700 bg-neutral-100 rounded-lg px-2 py-1 select-none border border-neutral-250 cursor-pointer"
                    >
                      <option value="未开始">未开始</option>
                      <option value="收集资料中">收集资料中</option>
                      <option value="已收集待审计">已收集待审计</option>
                      <option value="已审核">已审核通过✔</option>
                    </select>
                  </div>

                  <p className="text-2xs text-neutral-600 bg-neutral-50/50 p-2.5 rounded border border-neutral-150 leading-relaxed">
                    <b>核验方法与手段：</b> {item.description}
                  </p>

                  {/* Required Docs section */}
                  <div className="space-y-2 text-3xs">
                    <div className="flex justify-between items-center text-gray-500 font-bold">
                      <span className="flex items-center">
                        <FolderOpen className="h-3.5 w-3.5 text-gray-400 mr-1" />
                        要素证据链（需调取并核验的纸质/电子材料）：
                      </span>
                      <button
                        onClick={() => handleOpenArchiver(item)}
                        className="text-teal-650 hover:text-teal-800 font-semibold flex items-center space-x-0.5"
                      >
                        ⚡ 一键验证印鉴并归档
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.sourceDocs.map(doc => {
                        const isUploaded = item.uploadedDocs?.some(up => up.includes(doc) || doc.includes(up) || up.substring(0,4) === doc.substring(0,4));
                        return (
                          <span
                            key={doc}
                            className={`px-2 py-0.5 rounded text-4xs font-bold border ${
                              isUploaded 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-250"
                                : "bg-neutral-50 text-neutral-400 border-neutral-200 border-dashed"
                            }`}
                          >
                            {isUploaded ? "✔已核实：": "⏳缺件："} {doc}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom comments - and interview logs details */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-3 border-t border-neutral-100">
                    <div className="flex-1 text-4xs italic text-gray-500 leading-normal">
                      {item.meetingNotes ? (
                        <span className="bg-amber-50/35 p-1 rounded font-medium not-italic text-gray-600 block">
                          💭 现场座谈问询核实验印笔记: "{item.meetingNotes}"
                        </span>
                      ) : (
                        <span>暂无针对该专项问询CFO、CTO等人的访谈语音或实物查验证记日志。</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenNotes(item)}
                      className="px-2.5 py-1 text-4xs bg-neutral-50 hover:bg-neutral-100 rounded border border-neutral-200 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>{item.meetingNotes ? "追加问讯笔记" : "录入新现场谈话"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL 1: Recording field interview notes */}
      {editingItemId && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 border border-neutral-100 animate-fade-in font-sans">
            <h3 className="text-md font-bold text-neutral-800 mb-2 flex items-center">
              <MessageSquare className="h-5 w-5 text-teal-600 mr-2" />
              专项提问访谈与印证核验纪要
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              向企业CFO、法律顾问、大股东或上游代工厂进行现场印证时登记的书面纪要，将写入终期投资风控制造备忘：
            </p>

            <textarea
              value={meetingNotesTemp}
              onChange={(e) => setMeetingNotesTemp(e.target.value)}
              placeholder="请输入真实的现场问询反馈。如：2026/05/22PM段志华：在现场核对了上缴代工厂的账本发票明细，付款流水与账实完全相符..."
              className="w-full text-xs border border-neutral-200 rounded-lg p-3 h-32 bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-neutral-800"
            />

            <div className="flex justify-end space-x-2 pt-4 border-t border-neutral-100">
              <button
                onClick={() => setEditingItemId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-1.5 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 rounded-lg shadow-sm"
              >
                保存现场记录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Archiving of credentials */}
      {archivingItemId && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 border border-neutral-100 animate-fade-in font-sans">
            <h3 className="text-md font-bold text-neutral-800 mb-2 flex items-center text-teal-800">
              <FolderOpen className="h-5 w-5 mr-1 text-teal-600" />
              要素原件现场审核归档
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              勾选已核实确认无误、加盖企业红头公章、代工厂财务章或税控印鉴的原始档案要素：
            </p>

            <div className="space-y-3 bg-neutral-50 p-4 rounded-lg border border-neutral-100 max-h-48 overflow-y-auto">
              {(() => {
                const item = activeProj.checklists.find(i => i.id === archivingItemId) || activeItems.find(i => i.id === archivingItemId);
                return item?.sourceDocs.map(doc => {
                  const isChecked = selectedDocsToUpload.includes(doc + ".pdf") || selectedDocsToUpload.includes(doc + ".xlsx") || selectedDocsToUpload.includes(doc);
                  const toggleDoc = () => {
                    let fullDoc = doc;
                    if (!doc.includes(".")) {
                      fullDoc = doc + (doc.includes("账") || doc.includes("流水") ? ".xlsx" : ".pdf");
                    }
                    if (isChecked) {
                      setSelectedDocsToUpload(prev => prev.filter(f => f !== fullDoc && f !== doc));
                    } else {
                      setSelectedDocsToUpload(prev => [...prev, fullDoc]);
                    }
                  };
                  return (
                    <label key={doc} className="flex items-start space-x-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={toggleDoc}
                        className="h-4 w-4 text-teal-650 rounded border-neutral-300 mt-0.5"
                      />
                      <span className="text-xs text-neutral-700">{doc}</span>
                    </label>
                  );
                });
              })()}
            </div>

            <div className="space-y-1 mt-4">
              <label className="block text-3xs text-gray-400 font-bold uppercase">追加其他凭据文件名：</label>
              <input
                type="text"
                value={customDocName}
                onChange={(e) => setCustomDocName(e.target.value)}
                placeholder="例如：晶圆代工财务账核对证明.pdf"
                className="w-full text-xs rounded-lg border border-neutral-200 p-2 bg-neutral-50 font-medium focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-neutral-100">
              <button
                onClick={() => setArchivingItemId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleConfirmArchive}
                className="px-4 py-1.5 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 rounded-lg shadow-sm"
              >
                核准印鉴，确认归档
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
