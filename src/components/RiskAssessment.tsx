import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, HelpCircle, Sparkles, TrendingUp, Skull, ShieldCheck as ShieldIcon, Gauge, CheckSquare } from "lucide-react";
import { DDProject } from "../types";

interface RiskAssessmentProps {
  projects: DDProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onUpdateProjectFields: (projId: string, fields: Partial<DDProject>) => void;
}

export default function RiskAssessment({
  projects,
  activeProjectId,
  onSelectProject,
  onUpdateProjectFields
}: RiskAssessmentProps) {
  const activeProj = projects.find(p => p.id === activeProjectId) || projects[0];

  const [simulatedScore, setSimulatedScore] = useState<number>(
    activeProj.riskLevel === "高" ? 78 : activeProj.riskLevel === "中" ? 54 : 26
  );

  const [lastProjId, setLastProjId] = useState(activeProj.id);
  if (activeProj.id !== lastProjId) {
    setLastProjId(activeProj.id);
    setSimulatedScore(activeProj.riskLevel === "高" ? 78 : activeProj.riskLevel === "中" ? 54 : 26);
  }

  // Handle direct level adjustments
  const handleLevelChange = (level: "低" | "中" | "高") => {
    onUpdateProjectFields(activeProj.id, { riskLevel: level });
    setSimulatedScore(level === "高" ? 78 : level === "中" ? 54 : 26);
  };

  // Generate Red Flags based on target sector & data
  const getRedFlags = (proj: DDProject) => {
    if (proj.industry.includes("半导体") || proj.industry.includes("芯片")) {
      return [
        { title: "大股东股权回购对赌到期债务承压", detail: "2027年12月若上市失败，创始人触发连带回购义务。若无第三方代偿，大股东个人资产无法覆顶。", status: "极高风险", probability: "高", impact: "特大" },
        { title: "应收账款由于车企周转账期过度拉长", detail: "新能源客户A应收账款超过180天，计提比例仅按3%计提，坏账风险计提不充分，拉高了纸面ROE。", status: "高风险", probability: "中", impact: "大" },
        { title: "掩膜版(Photomask)与流片设备属地安全", detail: "重要资产存放于晶圆外包代工厂。现场虽核实发票，但代工断供风险无法自控。", status: "中风险", probability: "低", impact: "特大" }
      ];
    }
    if (proj.industry.includes("医药") || proj.industry.includes("新药")) {
      return [
        { title: "海外巨头专利纠纷引起出海管制隐患", detail: "海外专利侵权诉讼虽一审抗辩有利，但一旦和解破裂，可能直接切断境外流片或合作管线进度。", status: "极高风险", probability: "中", impact: "重大" },
        { title: "临床CRO费用资本化调节账面净利润", detail: "II期临床试验相关CRO合同累计欠款800万元，存在利用研发转资本化调节当期负债的合规风险。", status: "高风险", probability: "高", impact: "中" },
        { title: "新药IND批件的转移连带履约瑕疵", detail: "原始病例归档数据(CRF)在合作中心有少许遗漏错项行为，存在被药监局要求限期改正的警告风险。", status: "中风险", probability: "中", impact: "大" }
      ];
    }
    // SaaS sector
    return [
      { title: "递延确认未执行分摊标准虚增业绩", detail: "老客户订阅预收合同未严格采用月度直线法，存在部分提前结转为本期营业利润的会计操纵风险。", status: "高风险", probability: "低", impact: "大" },
      { title: "大客户流失风险引起的续约估值倒挂", detail: "头部三大国企客户的ARR占比达到52%。若因等保政策突变流失，ARR订阅基本盘将崩塌30%以上。", status: "中风险", probability: "中", impact: "大" },
      { title: "代码开源协议包含GPL传染开源合规风险", detail: "网关基础包涉及早期GPL开源遗留。虽未发现白盒传染，但若发生权属追索，存在核心资产公开漏洞。", status: "中风险", probability: "微弱", impact: "大" }
    ];
  };

  const redFlags = getRedFlags(activeProj);

  // Safeguards list
  const safeguards = [
    { title: "约定重大事项一票否决权与强制跟随权", desc: "由于是在审非标实体，PE投资人必须把控章程修订一票否决，核心持股大股东未经同意不得对外无约定质押股权。" },
    { title: "订立创始人控股权回购承诺与追索连带协议", desc: "把创始人全部对外代持理顺。如若遇突发海外专利阻碍或流片熔断，提前将退回本息权对准创始人连带责任范围。" },
    { title: "分段分批次注资 (Milestone Tranche Payments)", desc: "1.2亿对价不执行首笔全额。首付40%，临床II期成功解密或完成第二次主掩膜流片后再划拨下一笔60%资金，自降交易敞口。" }
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans" id="risk-assessment-panel">
      {/* 1. Selector */}
      <div className="bg-white border rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5.5 w-5.5 text-teal-600 shrink-0" />
          <div>
            <span className="text-3xs text-gray-400 font-bold uppercase tracking-wider block">标的项目风控评级切换：</span>
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
              <div className="flex space-x-1">
                <button
                  onClick={() => handleLevelChange("高")}
                  className={`px-2 py-0.5 rounded text-4xs font-bold border transition ${
                    activeProj.riskLevel === "高" ? "bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-300/40" : "bg-neutral-100 text-neutral-500 border-transparent hover:bg-neutral-200"
                  }`}
                >
                  HIGH 高
                </button>
                <button
                  onClick={() => handleLevelChange("中")}
                  className={`px-2 py-0.5 rounded text-4xs font-bold border transition ${
                    activeProj.riskLevel === "中" ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-neutral-100 text-neutral-500 border-transparent hover:bg-neutral-200"
                  }`}
                >
                  MED 中
                </button>
                <button
                  onClick={() => handleLevelChange("低")}
                  className={`px-2 py-0.5 rounded text-4xs font-bold border transition ${
                    activeProj.riskLevel === "低" ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-neutral-100 text-neutral-500 border-transparent hover:bg-neutral-200"
                  }`}
                >
                  LOW 低
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-3xs text-neutral-400 bg-neutral-50 p-2.5 rounded border border-neutral-100 max-w-sm">
          <span>💡 提示：本评级同步向整个大盘面板的过滤器进行热态路由同步，供投委决策会穿透跟踪。</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left grid panel: Gauge and Risk Probability Matrix */}
        <div className="lg:col-span-1 space-y-6">
          {/* Gauge card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 shadow-2xs">
            <h3 className="text-sm font-bold text-neutral-850 flex items-center border-b border-gray-150 pb-2">
              <Gauge className="h-4 w-4 text-teal-600 mr-2" />
              <span>综合投后风控暴险评测仪</span>
            </h3>

            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              {/* Radial metric circle using pure CSS */}
              <div className="relative h-32 w-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="stroke-gray-100"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`transition-all duration-300 ${
                      simulatedScore > 70 ? "stroke-rose-500" : simulatedScore > 40 ? "stroke-amber-500" : "stroke-emerald-500"
                    }`}
                    strokeDasharray={`${simulatedScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-sans">
                  <span className="text-2xl font-black text-gray-900">{simulatedScore}</span>
                  <span className="text-[9px] font-bold text-gray-400 tracking-wider">风控风险指数</span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className={`text-xs font-black uppercase ${simulatedScore > 70 ? "text-rose-600 font-bold" : simulatedScore > 45 ? "text-amber-600" : "text-emerald-700"}`}>
                  等级评判：{activeProj.riskLevel}风险权重标的
                </div>
                <p className="text-3xs text-gray-400 max-w-xs leading-normal">
                  此评估综合了受托财务账目流出的账账相符程度、对赌强制期、海外核心专利被行外优先抗辩概率等多变要素。
                </p>
              </div>
            </div>
          </div>

          {/* Matrix Card probability visual chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3.5 shadow-2xs">
            <h4 className="text-xs font-bold text-neutral-850 uppercase tracking-wider flex items-center">
              <TrendingUp className="h-4 w-4 text-teal-650 mr-1.5" />
              PE专业风险概率与破坏力象限图
            </h4>

            {/* Matrix 3x3 Grid chart mock with CSS */}
            <div className="grid grid-cols-4 gap-1.5 text-center text-4xs font-bold pt-2 select-none">
              {/* Impact Labels */}
              <div className="text-gray-400 flex items-center justify-center">特大</div>
              <div className="p-2 bg-amber-200 rounded text-amber-900">中 (应收账)</div>
              <div className="p-2 bg-rose-300 rounded text-rose-950 font-bold relative">
                高 (回购对赌)
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
              </div>
              <div className="p-2 bg-rose-400 rounded text-white text-3xs font-extrabold flex items-center justify-center">特大危机</div>

              <div className="text-gray-400 flex items-center justify-center">重大</div>
              <div className="p-2 bg-emerald-100 rounded text-emerald-800">低</div>
              <div className="p-2 bg-amber-200 rounded text-amber-900 font-bold">中 (专利纠纷)</div>
              <div className="p-2 bg-rose-300 rounded text-rose-950">高</div>

              <div className="text-gray-400 flex items-center justify-center">轻微</div>
              <div className="p-2 bg-emerald-50 rounded text-emerald-500">极低</div>
              <div className="p-2 bg-emerald-100 rounded text-emerald-800 font-bold">低 (开源协议)</div>
              <div className="p-2 bg-amber-200 rounded text-amber-900">中</div>

              {/* Probability Labels bottom */}
              <div></div>
              <div className="text-gray-400">低概率</div>
              <div className="text-gray-400">中等概率</div>
              <div className="text-gray-400">极高概率</div>
            </div>
            
            <p className="text-[10px] text-gray-400 leading-normal text-center pt-2">
              (横轴：发生概率，纵轴：破坏力严重度)
            </p>
          </div>
        </div>

        {/* Right grid panel: Red Flags ledger and solutions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Red flag ledger */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-800 flex items-center space-x-1.5 border-b border-gray-150 pb-2">
              <Skull className="h-4.5 w-4.5 text-rose-600 shrink-0" />
              <span>标的四大专项隐性红旗预警台账 (Red Flags)</span>
            </h3>

            <div className="space-y-4">
              {redFlags.map(flag => (
                <div key={flag.title} className="bg-white border rounded-xl p-4 shadow-2xs space-y-2 border-l-4 border-l-rose-500">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold text-neutral-850">{flag.title}</h4>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-4xs font-bold border border-rose-200">
                      暴风级：{flag.status} · 严重：{flag.impact}
                    </span>
                  </div>
                  <p className="text-2xs text-neutral-600 leading-relaxed font-sans bg-neutral-50/50 p-2 rounded border border-neutral-100">
                    {flag.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Protective covenants and safeguards */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-800 flex items-center space-x-1.5 border-b border-gray-150 pb-2">
              <ShieldIcon className="h-4.5 w-4.5 text-teal-650" />
              <span>投资协议(SPA/SHA)合规防御性及买方特许条款建议</span>
            </h3>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-2xs">
              <p className="text-2xs text-gray-500 leading-relaxed">
                针对上述摸排出的隐形红旗与表外无限连带回购敞口，法务组和合规风控官提报在SPA中约定以下强制防御策略：
              </p>

              <div className="space-y-3.5">
                {safeguards.map((item, idx) => (
                  <div key={item.title} className="flex gap-2.5 items-start">
                    <span className="h-5 w-5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-extrabold text-neutral-800">{item.title}</h4>
                      <p className="text-2xs text-neutral-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
