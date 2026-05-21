import React, { useState } from "react";
import { FileText, Calendar, Compass, Milestone, ArrowRight, CheckCircle2, AlertTriangle, Users, Building, Activity, RefreshCw } from "lucide-react";
import { DDProject } from "../types";

interface ProjectDetailProps {
  projects: DDProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onUpdateProjectFields: (projId: string, fields: Partial<DDProject>) => void;
}

export default function ProjectDetail({
  projects,
  activeProjectId,
  onSelectProject,
  onUpdateProjectFields
}: ProjectDetailProps) {
  const activeProj = projects.find(p => p.id === activeProjectId) || projects[0];

  const [editPM, setEditPM] = useState(activeProj.leadPM);
  const [editAmount, setEditAmount] = useState(activeProj.targetAmount);
  const [isSaved, setIsSaved] = useState(false);

  // Synchronize input fields if active project changes
  const [lastProjId, setLastProjId] = useState(activeProj.id);
  if (activeProj.id !== lastProjId) {
    setLastProjId(activeProj.id);
    setEditPM(activeProj.leadPM);
    setEditAmount(activeProj.targetAmount);
    setIsSaved(false);
  }

  // Define PE due diligence process milestones
  const milestones = [
    { title: "立项初审与反洗钱合规登记", desc: "完成标的核定、反洗钱检查并会同内控合规中心签置排他双向NDA保护性条款。", phase: "立项中", date: "第一周" },
    { title: "第三方顾问进场暨专项方案发布", desc: "法务、财务、各技术专家底稿核查任务发布与清单映射设定。", phase: "现场尽调中", date: "第二周" },
    { title: "四大维度印证与疑点访谈纪要", desc: "对受托底稿原件、银行资金账簿验证核对，记录和创始人对赌口径并归档审计链。", phase: "现场尽调中", date: "第三周" },
    { title: "AI联动审核与红旗评估底稿汇总", desc: "完成高频泄密、GPL开源漏洞、未结海外纠纷和控制权不稳等大盘红旗穿透并评定风险评级。", phase: "报告撰写中", date: "第四周" },
    { title: "撰写秘密投决备忘录与红线纠偏", desc: "组织撰写合规和核定估值报告，追加买方防卫条款草案并汇总。", phase: "报告撰写中", date: "第五周" },
    { title: "风控中心最终合规签注与投委审议", desc: "投委会正式合议，现场质疑对赌承压实力，决议是否推进出资与托管。", phase: "投决会审核", date: "第六周" },
    { title: "交易印鉴全要素归档与本期建档", desc: "完成本期电子和纸质档案双印密级保管，同步生成历史审计防算序列。", phase: "已归档", date: "持续服务" }
  ];

  const currentPhaseIndex = milestones.findIndex(m => m.phase === activeProj.status);

  const handleQuickSave = () => {
    onUpdateProjectFields(activeProj.id, {
      leadPM: editPM,
      targetAmount: editAmount
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const advancePhase = () => {
    const statuses: Array<DDProject["status"]> = ["立项中", "现场尽调中", "报告撰写中", "投决会审核", "已归档"];
    const currentIdx = statuses.indexOf(activeProj.status);
    if (currentIdx < statuses.length - 1) {
      const nextStatus = statuses[currentIdx + 1];
      // Increment completeness percentage along with phase
      const nextCompleteness = Math.min(100, activeProj.completeness + 15);
      onUpdateProjectFields(activeProj.id, {
        status: nextStatus,
        completeness: nextCompleteness
      });
    } else {
      alert("该项目已经进入「已归档」最终结项状态，无法继续向前演进项目阶段。");
    }
  };

  const rollbackPhase = () => {
    const statuses: Array<DDProject["status"]> = ["立项中", "现场尽调中", "报告撰写中", "投决会审核", "已归档"];
    const currentIdx = statuses.indexOf(activeProj.status);
    if (currentIdx > 0) {
      const prevStatus = statuses[currentIdx - 1];
      const prevCompleteness = Math.max(0, activeProj.completeness - 15);
      onUpdateProjectFields(activeProj.id, {
        status: prevStatus,
        completeness: prevCompleteness
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="project-detail-panel">
      {/* 1. Selector bar */}
      <div className="bg-white border rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Milestone className="h-5 w-5 text-teal-600 shrink-0" />
          <div>
            <span className="text-3xs text-gray-400 font-bold uppercase tracking-wider block">项目流转详情映射标的：</span>
            <div className="flex items-center space-x-2">
              <select
                value={activeProj.id}
                onChange={(e) => onSelectProject(e.target.value)}
                className="text-sm font-extrabold text-gray-800 bg-neutral-50 px-3 py-1 rounded-lg border border-gray-250 focus:outline-none focus:ring-1 focus:ring-teal-500 hover:cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.companyName}</option>
                ))}
              </select>
              <span className="text-3xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-bold">
                {activeProj.industry}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={rollbackPhase}
            disabled={activeProj.status === "立项中"}
            className="px-3 py-1.5 border hover:bg-neutral-50 rounded-lg text-2xs font-semibold hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ↩ 回退上一阶段
          </button>
          
          <button 
            onClick={advancePhase}
            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-2xs font-bold hover:cursor-pointer shadow-sm transition"
          >
            🎯 推进下一流程节点
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Fact Sheets & in-line modifiers */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-extrabold text-neutral-850 flex items-center border-b border-neutral-100 pb-2">
              <Building className="h-4 w-4 text-teal-600 mr-1.5" />
              <span>标的公司项目基本面</span>
            </h3>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="text-gray-400 block text-3xs font-bold uppercase">标的名称</span>
                <span className="font-bold text-gray-800 mt-1 block h-5 leading-snug break-all">{activeProj.companyName}</span>
              </div>

              <div>
                <span className="text-gray-400 block text-3xs font-bold uppercase">业务蓝图背景描述</span>
                <span className="text-neutral-600 mt-1 block leading-relaxed text-2xs bg-neutral-50 p-2.5 rounded border border-neutral-100">
                  {activeProj.description}
                </span>
              </div>

              {/* Modify lead PM and Target Amount inline */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-gray-400 block text-3xs font-bold uppercase mb-1">主审PM负责人</label>
                  <input
                    type="text"
                    value={editPM}
                    onChange={(e) => setEditPM(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg bg-neutral-50 border border-neutral-200 p-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block text-3xs font-bold uppercase mb-1">拟投交易对价</label>
                  <input
                    type="text"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg bg-neutral-50 border border-neutral-200 p-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleQuickSave}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white rounded-lg text-2xs font-bold hover:cursor-pointer transition-all"
                >
                  <RefreshCw className="h-3 w-3 text-white" />
                  <span>{isSaved ? "已更新至系统大盘✔" : "保存基本面更正项"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick specs for audits */}
          <div className="bg-neutral-850 text-white p-5 rounded-xl space-y-4 shadow-sm font-sans">
            <h4 className="text-xs font-bold tracking-wider text-teal-300 uppercase flex items-center">
              <Activity className="h-4 w-4 mr-1 text-teal-400" /> 
              现场全维度渗透查证指标
            </h4>

            <div className="space-y-3.5 text-2xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                <span className="text-white/60">已知核心资产：</span>
                <span className="font-bold text-white/95 text-right font-mono text-[11px] truncate max-w-[140px]" title={activeProj.coreAssets}>
                  {activeProj.coreAssets || "无形资产及设备"}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                <span className="text-white/60">流动与表外负债排查：</span>
                <span className="font-bold text-white/95 text-right font-mono text-[11px] truncate max-w-[140px]" title={activeProj.coreLiabilities}>
                  {activeProj.coreLiabilities || "短期流动对赌欠款"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-0.5">
                <span className="text-white/60">账外或有涉诉状况：</span>
                <span className="font-bold text-rose-300 text-right">
                  {activeProj.riskLevel === "高" ? "⚠️ 疑似有海外纠纷/强制期" : "已审查并对账"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Process Flow Chart Timeline UI */}
        <div className="lg:col-span-2 space-y-4 pb-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h3 className="text-sm font-extrabold text-neutral-800 flex items-center space-x-1.5">
              <Compass className="h-4.5 w-4.5 text-teal-650" />
              <span>私募股权拟投尽职调查全合规流程图 ({milestones.length}个主线卡口)</span>
            </h3>
            <span className="text-4xs text-gray-400 font-bold uppercase">自研风控底线一屏核对</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-2xs relative">
            <div className="absolute top-12 bottom-12 left-[23px] w-0.5 bg-neutral-100 pointer-events-none"></div>

            <div className="space-y-6">
              {milestones.map((milestone, idx) => {
                const isCompleted = idx < currentPhaseIndex;
                const isCurrent = idx === currentPhaseIndex;
                const isBlocked = idx > currentPhaseIndex;

                let badgeColor = "bg-neutral-100 text-neutral-400 border-neutral-200";
                let dotColor = "border-neutral-200 text-neutral-400 bg-white";
                if (isCompleted) {
                  badgeColor = "bg-teal-50 text-teal-700 border-teal-200";
                  dotColor = "border-teal-500 bg-teal-500 text-white";
                } else if (isCurrent) {
                  badgeColor = "bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-100 animate-pulse";
                  dotColor = "border-amber-500 text-amber-600 bg-amber-50 font-bold scale-110 shadow-xs";
                }

                return (
                  <div key={milestone.title} className="flex gap-4 relative items-start group">
                    {/* Circle Node */}
                    <div className={`h-11 w-11 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-mono transition-all z-10 ${dotColor}`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : (
                        <span>0{idx + 1}</span>
                      )}
                    </div>

                    {/* Meta and explanation text */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <h4 className={`text-xs font-extrabold leading-snug ${isCurrent ? "text-neutral-900 scale-[1.01]" : isCompleted ? "text-neutral-700" : "text-neutral-400"}`}>
                          {milestone.title}
                        </h4>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-4xs text-gray-400 font-bold shrink-0">{milestone.date}</span>
                          <span className={`px-2 py-0.5 rounded text-4xs border font-medium shrink-0 ${badgeColor}`}>
                            {isCompleted ? "流程通过✔" : isCurrent ? "正在办理审查中.." : "锁定待推进"}
                          </span>
                        </div>
                      </div>

                      <p className={`text-2xs leading-relaxed ${isCurrent ? "text-neutral-650" : isCompleted ? "text-neutral-500" : "text-neutral-400/80"}`}>
                        {milestone.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
