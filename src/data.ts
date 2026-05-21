import { DDProject, ArchivedDoc } from "./types";

export const INITIAL_PROJECTS: DDProject[] = [
  {
    id: "proj_1",
    companyName: "芯能微电子股份有限公司",
    industry: "半导体设计与芯片制造",
    targetAmount: "8,500万人民币",
    leadPM: "段志华",
    status: "现场尽调中",
    completeness: 65,
    riskLevel: "高",
    description: "致力于车规级IGBT和三代半导体碳化硅(SiC)功率器件研发，拥有多项国际PCT核心发明专利，正处于流片关键攻坚阶段，核心供应链需要现场穿透审计。",
    financialSummary: "2025年实现营收4200万元，净利润为-1200万元（研发高投入）。账面货币资金800万元，应付流片账款1500万元处于待清偿状态。主要应收账款集中于两家主力新能源车企。",
    coreAssets: "拥有功率半导体版图设计专利书、SiC工艺流片掩膜版(Photomask)、高精尖实验室测试设备（估值约3500万元）、两项核心发明专利权。",
    coreLiabilities: "短期负债2200万（含向上游晶圆厂的预付应付款），暂无长期负债，有一笔1000万的创始人股权回购对赌负约担保条款。",
    checklists: [
      {
        id: "c1_1",
        category: "资产和负债情况",
        title: "核实流片掩膜版(Photomask)与实验室设备权属及估值",
        description: "现场核查测试设备发票、资产交付单及账面折旧政策；核对掩膜版研发资产在晶圆代工厂(TSMC/SMIC)的权属保管证明。",
        importance: "高",
        status: "已审核",
        assignee: "段志华",
        sourceDocs: ["固定资产购置发票", "晶圆代工寄存保管协议", "资产评估报告"],
        uploadedDocs: ["固定资产购置发票.pdf", "资产评估报告.doc"],
        meetingNotes: "2026/05/10 段志华: 现场核查了3500万元的实验室设备，已见相关发票与设备编码一致。掩膜版寄存保管信及所有权在代工厂处得到书面确认，资产权属明晰。"
      },
      {
        id: "c1_2",
        category: "资产和负债情况",
        title: "核实应收账款周转期及坏账拨备充足度",
        description: "调阅近两年应收账款账龄分析表，函证新能源车企客户，评估下游回款信用、长账龄客户的坏账风险性。",
        importance: "高",
        status: "已收集待审计",
        assignee: "财务尽调顾问-张琳",
        sourceDocs: ["应收账款明细账", "客户询证函回函率统计", "坏账计提管理办法"],
        uploadedDocs: ["应收账款明细账_2025_2026.xlsx"],
        meetingNotes: "2026/05/18 张琳: 新能源客户A占应收总额的58%，回款周期已拉长至180天，存在坏账计提不充分的嫌疑，正在重新模拟计提。"
      },
      {
        id: "c1_3",
        category: "经营和财务情况",
        title: "大额流片支出及研发资本化合规性核查",
        description: "穿透核查研发费用中“流片成本”的真实性，审查是否存在研发资本化比例过高以粉饰净资产的情形。",
        importance: "高",
        status: "收集资料中",
        assignee: "段志华",
        sourceDocs: ["流片技术服务合同", "研发台账记账凭证", "资本化立项评估报告"],
        uploadedDocs: [],
        meetingNotes: ""
      },
      {
        id: "c1_4",
        category: "法律关系",
        title: "核查核心高管竞业限制阻碍与专利侵权风险",
        description: "调取CTO等研发团队核心高管的前司竞业协议及离职清白书；检索SiC沟槽栅工艺专利的第三方侵权风险性。",
        importance: "高",
        status: "已审核",
        assignee: "合规法务-陈星宇",
        sourceDocs: ["CTO离职清白免责函", "专利检索及侵权FTO分析报告"],
        uploadedDocs: ["CTO离职清白免责函.pdf", "SiC核心专利FTO法律评级.pdf"],
        meetingNotes: "2026/05/12 陈星宇: CTO前司豁免竞业的法律文件齐全，该FTO检索显示暂无直接侵权第三方的风险，专利关系确立无争议。"
      },
      {
        id: "c1_5",
        category: "机会与潜在风险",
        title: "技术代际迭代及大厂产能排期风险评估",
        description: "评估第三代半导体技术演变是否导致现有产线贬值；测算晶圆代工厂紧俏排单对公司流片进度的制约风险。",
        importance: "中",
        status: "收集资料中",
        assignee: "行业顾问-余建国",
        sourceDocs: ["产能保障意向协议", "行业技术趋势研究结论"],
        uploadedDocs: [],
        meetingNotes: ""
      },
      {
        id: "c1_6",
        category: "法律关系",
        title: "核实大股东股权回购对赌及质押隐患",
        description: "调阅创始人历史对赌协议及增资备忘录；确认大股东是否存在大比例股权对外代持和股权向第三方质押借贷问题。",
        importance: "高",
        status: "已收集待审计",
        assignee: "合规法务-陈星宇",
        sourceDocs: ["工商历史章程修正案", "创始人历史对赌确认书", "出资代持自查报告"],
        uploadedDocs: ["历史对赌协议核查分析.docx"],
        meetingNotes: "2026/05/15 陈星宇: 历史对赌显示若公司在2027年12月前未能通过IPO，创始人需面临强制回购，此压力较大，需反映在投资备忘录中。"
      }
    ]
  },
  {
    id: "proj_2",
    companyName: "绿康源创新生物制药有限公司",
    industry: "生物医药研发与新药制造",
    targetAmount: "1.2亿人民币",
    leadPM: "许志勇",
    status: "立项中",
    completeness: 30,
    riskLevel: "高",
    description: "专攻一类抗肿瘤靶向小分子核药制剂，部分在研产品已进入临床II期。尽调需重点关注药品批件、临床试验财务合规及核心专利诉讼。",
    financialSummary: "账面研发费用近三年复合增长120%，累计亏损1.8亿元。正在争取新一轮1.2亿过桥贷款与股权融资。近期有一桩与海外巨头的专利优先权未决争议诉讼扣押中。",
    coreAssets: "3个核心化合物新药临床试验通知书(IND批件)、5项国家发明授权、临床中心合作研究原始病例数据(CRF)归档所有权。",
    coreLiabilities: "存在一笔1200万元的政府科研无息补助待验收转消，对合作临床CRO机构累积未付款项800万元。",
    checklists: [
      {
        id: "c2_1",
        category: "资产和负债情况",
        title: "确认临床批件及临床数据资产的法律完整性",
        description: "到国家药监局CDE窗口及官方系统交叉核对肿瘤新药临床批件权属；封样对比现场临床试验CRO出具的患者数据原始入组台账。",
        importance: "高",
        status: "收集资料中",
        assignee: "许志勇",
        sourceDocs: ["国家药监局临床研究IND通知书", "药物临床试验合规性声明", "CRO服务质量确认单"],
        uploadedDocs: [],
        meetingNotes: ""
      },
      {
        id: "c2_2",
        category: "法律关系",
        title: "海外专利诉讼风险穿透及赔偿金额预估",
        description: "聘请专业涉外产权律所，出具专利独立性与先诉起诉抗辩意见，预估可能产生的最高赔偿额和禁售对业务基本盘的毁灭冲击。",
        importance: "高",
        status: "已收集待审计",
        assignee: "外部律所-王律师",
        sourceDocs: ["起诉状正本及传票影印件", "专利抗辩律所意见备忘录"],
        uploadedDocs: ["涉外专利诉讼风险评估意见.pdf"],
        meetingNotes: "2026/05/19 王律师: 初步评估显示该诉讼虽然对方要求索赔2000万，但由于先起诉抗辩法理在我国存在优势，可大概率通过和解或反诉驳回，实质损失可控。"
      }
    ]
  },
  {
    id: "proj_3",
    companyName: "安极云安全科技有限公司",
    industry: "云计算与网络安全SaaS",
    targetAmount: "4,000万人民币",
    leadPM: "宋雅丽",
    status: "现场尽调中",
    completeness: 85,
    riskLevel: "中",
    description: "提供面向多云架构的零信任主机安全系统和云原生容器WAF，采用SaaS订阅制。财务尽调核心关注递延收入、大客户流失率及关键代码安全合规。",
    financialSummary: "2025年订阅制年经常性净收入(ARR)过3200万元，续签率92%，现金流已转正，毛利率高达84%。账期基本在90天内，账目完整。创始人有2亿估值承诺。",
    coreAssets: "核心网关多维防护引擎代码库、十多家部委和大型国企订阅式持续订单期合同、拥有等保三级云安全服务商资质。",
    coreLiabilities: "主要为1800万元预收企业SaaS服务费产生的递延收入（非现金偿还风险，为时间性递延）。暂无任何外部信用借贷。",
    checklists: [
      {
        id: "c3_1",
        category: "经营和财务情况",
        title: "核查递延收益确认标准及大客户付款周期",
        description: "核实月度ARR/MRR递延分摊入账算法，核对云服务账簿账目凭单，防范通过操纵预收收入来调平当期财报利润的行为。",
        importance: "高",
        status: "已审核",
        assignee: "宋雅丽",
        sourceDocs: ["递延收入确认明细报表", "核心大客户银行付款回单"],
        uploadedDocs: ["2025递延分摊审计比对表.xlsx", "核心大客户付款回单清单.pdf"],
        meetingNotes: "2026/05/11 宋雅丽: 抽样对比了前五大政企客户的订阅合同和月度SAAS分摊记录，确认递延收入摊销严格遵循月度直线法，无虚增账面净利情况。"
      },
      {
        id: "c3_2",
        category: "经营和财务情况",
        title: "校核客户流失率跟SAAS续约账簿",
        description: "提取多租户系统的底层活跃日志，比对财务账面上续订用户的汇款周期，测算核心净保留率(NDR)。",
        importance: "高",
        status: "已审核",
        assignee: "宋雅丽",
        sourceDocs: ["SAAS后台活跃数据报告", "SAAS续约合同跟台账"],
        uploadedDocs: ["续约日志及流失率测算.xlsx"],
        meetingNotes: "2026/05/14 宋雅丽: NDR（净金额续约率）高达112%，表明老客户增购意愿旺盛，业务成长后劲充足，SaaS大盘非常健康。"
      },
      {
        id: "c3_3",
        category: "机会与潜在风险",
        title: "等保合规及关键代码库知识产权自查",
        description: "安排白盒审计检测其云安全产品里是否存在过多开源和GPL协议代码导致存在被反诉或核心源码被迫开源的风险。",
        importance: "高",
        status: "已收集待审计",
        assignee: "技术支持-任工",
        sourceDocs: ["国家等保三级评测书", "软件开源代码白盒审计报告"],
        uploadedDocs: ["等保三级核验复印书.pdf"],
        meetingNotes: "2026/05/17 任工: 关键网关引擎已经完成白盒扫描，未见致命GPL条款。等保三级文件为真，有效期到2028年，合规度佳。"
      }
    ]
  }
];

export const MOCK_ARCHIVED_FILES: ArchivedDoc[] = [
  {
    id: "doc_1",
    projectId: "proj_1",
    fileName: "固定资产购置发票.pdf",
    category: "资产负债",
    uploadDate: "2026-05-10",
    uploader: "段志华",
    size: "12.4 MB",
    isVerified: true,
    notes: "实验室高规格测试分析设备，发票金额2450万元，完税证明章清晰可见。"
  },
  {
    id: "doc_2",
    projectId: "proj_1",
    fileName: "资产评估报告.doc",
    category: "资产负债",
    uploadDate: "2026-05-10",
    uploader: "中京资产评估所-李评估师",
    size: "3.2 MB",
    isVerified: true,
    notes: "由具备证券资格的第三方评估出具，认为测试设备与工艺评估价格基本合理。"
  },
  {
    id: "doc_3",
    projectId: "proj_1",
    fileName: "应收账款明细账_2025_2026.xlsx",
    category: "经营财务",
    uploadDate: "2026-05-18",
    uploader: "财务尽调顾问-张琳",
    size: "1.4 MB",
    isVerified: false,
    notes: "需要重点核算账龄超半年、对准新能源车企客户A的单期逾期总账，存坏账危险。"
  },
  {
    id: "doc_4",
    projectId: "proj_1",
    fileName: "CTO离职清白免责函.pdf",
    category: "法律合规",
    uploadDate: "2026-05-12",
    uploader: "合规法务-陈星宇",
    size: "820 KB",
    isVerified: true,
    notes: "CTO前东家法务出具的书面证明，豁免了特定车规功率半导体高压芯片研发的竞业追索。"
  },
  {
    id: "doc_5",
    projectId: "proj_1",
    fileName: "SiC核心专利FTO法律评级.pdf",
    category: "法律合规",
    uploadDate: "2026-05-12",
    uploader: "高文知识产权律师事务所",
    size: "4.5 MB",
    isVerified: true,
    notes: "对全球排名前50功率半导体巨头做横向分析，在核心工艺层面的可自由利用(FTO)程度良好。"
  },
  {
    id: "doc_6",
    projectId: "proj_1",
    fileName: "历史对赌协议核查分析.docx",
    category: "风控与报告",
    uploadDate: "2026-05-15",
    uploader: "合规法务-陈星宇",
    size: "440 KB",
    isVerified: false,
    notes: "创始人向老一轮财务股东签署对对赌协议重演，有股份补偿条款，需加倍留意其控制权可能丧失的危害。"
  },
  {
    id: "doc_7",
    projectId: "proj_2",
    fileName: "涉外专利诉讼风险评估意见.pdf",
    category: "法律合规",
    uploadDate: "2026-05-19",
    uploader: "外部律所-王律师",
    size: "2.1 MB",
    isVerified: false,
    notes: "对方举证并不牢靠，针对其中两项说明我国享有优先使用抗辩权。"
  },
  {
    id: "doc_8",
    projectId: "proj_3",
    fileName: "2025递延分摊审计比对表.xlsx",
    category: "经营财务",
    uploadDate: "2026-05-11",
    uploader: "宋雅丽",
    size: "3.7 MB",
    isVerified: true,
    notes: "校验ARR递延合理性的主要核算底稿，采用12个月直线均摊。"
  },
  {
    id: "doc_9",
    projectId: "proj_3",
    fileName: "核心大客户付款回单清单.pdf",
    category: "经营财务",
    uploadDate: "2026-05-11",
    uploader: "宋雅丽",
    size: "1.8 MB",
    isVerified: true,
    notes: "银行原始收款电子凭据合集，涉及部委和大企一共八份付单，总额超过一千万元。"
  },
  {
    id: "doc_10",
    projectId: "proj_3",
    fileName: "续约日志及流失率测算.xlsx",
    category: "经营财务",
    uploadDate: "2026-05-14",
    uploader: "宋雅丽",
    size: "1.1 MB",
    isVerified: true,
    notes: "包含2024-2025多期SAAS云后台服务器高频账期记录，确认退订率仅有1.4%。"
  },
  {
    id: "doc_11",
    projectId: "proj_3",
    fileName: "等保级自评及自查说明书.pdf",
    category: "风控与报告",
    uploadDate: "2026-05-17",
    uploader: "技术支持-任工",
    size: "3.3 MB",
    isVerified: true,
    notes: "国家公安和网协部门正式盖章生效的三级等保证书影印件，在册合规无污点。"
  }
];
