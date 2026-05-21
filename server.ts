import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Lazy initialize general Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features might fail.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key || "PLACEHOLDER_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API endpoints and routing
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 1. Generate Sector-Specific Due Diligence Checklist
app.post("/api/gemini/generate-checklist", async (req, res) => {
  try {
    const { companyName, industry, description } = req.body;
    if (!industry || !companyName) {
      return res.status(400).json({ error: "Missing companyName or industry" });
    }

    const ai = getGeminiClient();
    const prompt = `您是一位资深的私募股权投资(PE)项目投资经理和尽调专家。请针对以下公司背景制定一份深度的尽职调查清单大纲：
目标公司名称: ${companyName}
所属行业: ${industry}
公司简介: ${description || "暂无具体背景"}

围绕以下四个核心尽调维度（如图片中所标注的重点）生成深度、具体、贴近该行业的核查要点：
1. 资产和负债情况 (Assets & Liabilities): 关注主要的有形与无形资产、应收账款风险、债务结构、表外负债、关联交易及质押等。
2. 经营和财务情况 (Operations & Finance): 关注该行业核心商业模式稳定性、关联交易、财务数据真实性、现金流及毛利率变化、主要客户与供应商依赖。
3. 法律关系 (Legal Relations): 关注历史股权变更合规性、核心知识产权、关键合同、劳动用工法律争议、环保或资质合规等。
4. 机会与潜在风险 (Opportunities & Risks): 关注行业竞争壁垒、政策风险、技术迭代、并购整合协同性、未来退出路径风险。

请根据行业定制（例如：如果是芯片半导体行业，需关注专利、流片成本、供应链产能；如果是生物医药，需关注临床研发阶段、药证批准等）。
请严格以 JSON 格式返回，结构包含一个 categories 数组，格式如下：
{
  "categories": [
    {
      "name": "资产和负债情况",
      "items": [
        {
          "title": "核查应收账款及逾期风险",
          "description": "说明具体核查手段或需要调阅的对应企业资料",
          "importance": "高",
          "sourceDocs": ["应收账款明细账", "主要客户对账单"]
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        importance: { type: Type.STRING, description: "高/中/低" },
                        sourceDocs: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "建议收集归档的业务材料清单"
                        }
                      },
                      required: ["title", "description", "importance", "sourceDocs"]
                    }
                  }
                },
                required: ["name", "items"]
              }
            }
          },
          required: ["categories"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error generating checklist:", error);
    res.status(500).json({ error: error.message || "Failed to generate checklist" });
  }
});

// 2. Analyze Financial Red Flags and Investment Opportunities
app.post("/api/gemini/analyze-risks", async (req, res) => {
  try {
    const { companyName, industry, financialSummary, coreAssets, coreLaibilities } = req.body;
    const ai = getGeminiClient();

    const prompt = `您是PE机构的合规风控总监 (Risk Control Director) 和财务合规审计专家。
请对以下拟投资的非上市目标公司资产债务及财务情况进行“红旗预警”(Red Flag Analysis) 以及“投资可行性与机会分析”。

【目标公司基本情况】
目标公司名称: ${companyName || "暂无"}
所属行业: ${industry || "暂无"}
核心资产状况: ${coreAssets || "未提供"}
核心负债状况: ${coreLaibilities || "未提供"}
经营及财务数据概要: ${financialSummary || "未提供"}

【分析要点】
1. 资产质量与债务合规性：是否存在资产注水、高额表外负债或过度借贷风险？
2. 经营与现金流健康度：收入真实性疑点有哪些？现金流是否能支持运营？
3. 重点财务红旗 (Finance Red Flags)：给出至少3个最严峻的潜在疑点（比如：应收坏账、关联输送风险、存货周转等）。
4. 投资可行性评分（0-100分）及改进建议。

请严格以 JSON 格式返回，格式如下：
{
  "redFlags": [
    {
      "title": "风险点名称",
      "riskLevel": "高 / 中",
      "impact": "对估值或股权交易的具体潜在影响",
      "auditAdvice": "针对该项进行现场尽调穿透审计的具体手段建议"
    }
  ],
  "opportunities": [
    {
      "title": "机会/壁垒名称",
      "description": "未来高成长性、技术壁垒或资源协同效益"
    }
  ],
  "feasibilityScore": 75,
  "summaryAdvice": "风控结论及下一步现场核实的核心指导思想"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            redFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  auditAdvice: { type: Type.STRING }
                },
                required: ["title", "riskLevel", "impact", "auditAdvice"]
              }
            },
            opportunities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["title", "description"]
              }
            },
            feasibilityScore: { type: Type.INTEGER },
            summaryAdvice: { type: Type.STRING }
          },
          required: ["redFlags", "opportunities", "feasibilityScore", "summaryAdvice"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error analyzing risks:", error);
    res.status(500).json({ error: error.message || "Failed to analyze risks" });
  }
});

// 3. Draft Interview Questionnaire Outline
app.post("/api/gemini/draft-interview", async (req, res) => {
  try {
    const { companyName, industry, description, roles } = req.body;
    const ai = getGeminiClient();

    const rolesStr = (roles || ["创始人/CEO", "财务总监(CFO)", "技术/生产负责人", "法务负责人"]).join("、");

    const prompt = `为非上市公司 [${companyName || "目标企业"}] (行业：${industry || "通用行业"}) 制定现场访谈提纲。
公司简介：${description || "非上市企业"}
需要访谈的角色：${rolesStr}

请为每个指定的角色各生成3-4个最具有穿透力、无法只靠财务报表看出的本行业关键性调查问题（深入刺探核心客户垄断、表外贷款、实控人关联担保、核心技术真实进度、股权纠纷隐患等）。

请以 JSON 格式输出，结构如下：
{
  "interviews": [
    {
      "role": "访问角色，例如：财务总监(CFO)",
      "purpose": "访谈核心目的描述",
      "questions": [
        {
          "question": "具体的突破口问题，例如：关于应收账款期末暴增、集中度过高原因？",
          "technique": "观察访谈答复时可结合的穿透核验方式"
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interviews: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        technique: { type: Type.STRING }
                      },
                      required: ["question", "technique"]
                    }
                  }
                },
                required: ["role", "purpose", "questions"]
              }
            }
          },
          required: ["interviews"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error drafting interview:", error);
    res.status(500).json({ error: error.message || "Failed to draft interview" });
  }
});

// 4. BA Requirements Consultant Live Chat Simulation
app.post("/api/gemini/ba-consult", async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `您是专业的非标投资业务管理系统业务分析师（BA，Business Analyst）。
当前场景：由于非上市公司信息披露极不透明，用户（PE项目负责人、法务合规人员）正在使用本“尽职调查管理模块”来进行现场尽调与资料归档。
您的职责：
1. 协助用户分析如何在系统中配置和落实尽职调查的4大板块（资产和负债、经营和财务、法律关系、机会与潜在风险）。
2. 解答如何规范归档、调阅对应的财务报表、合同、清偿材料。
3. 如果用户描述了他们特殊的尽调需求或行业，给出最佳的业务梳理建议和流程标准，并引导用户如何在系统的“执行看板”中把控这些风险。
4. 语言要专业、亲切、通俗易懂，符合专业系统BA的资深顾问形象。回复不应过长，每次保持在300字以内，采用Markdown分段列出。`;

    const chatHistory = (history || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }]
    }));

    // Add current user message
    chatHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatHistory,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error in BA consult:", error);
    res.status(500).json({ error: error.message || "Consultation failed" });
  }
});

// 5. One-Key Diligence Report Memo Generator
app.post("/api/gemini/generate-diligence-memo", async (req, res) => {
  try {
    const {
      companyName,
      industry,
      description,
      riskLevel,
      draftNotes,
      reportTone,
      includeSummary,
      includeAssets,
      includeRedFlags,
      includePrecautionary
    } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `您是顶级私募股权基金投决会的风控与法律合规首席专家（Chief Risk Officer）。
请以专业、严肃、不容置疑、深入骨髓的金融穿透审计口吻，起草一份针对【${companyName}】（非上市实体）的绝密投资尽职调查特别合规合意备忘录。
报告基调风格：${reportTone === "Strict" ? "极其严苛防御性、重点揭露坏账和股份代持漏洞、建议设立层层连带回售" : reportTone === "Optimistic" ? "在重点风控底线下建设性推进、发掘投后壁垒机会、偏温和" : "中性、公平、真实反映现场穿透结果"}。
请务必结合用户手动追加的现场手记：『${draftNotes || "无附加备注"}』。
格式要求：按照Markdown格式排版。请在段落中清晰体现以下要素，每段落使用指定的子标题分拆。`;

    const prompt = `起草合规调查结论。

必需包含以下指定的层级结构：
### 【绝密级】私募股权投委特别审查合议备忘录 (CONFIDENTIAL SPECIAL MEMODANDUM)

**关于 ${companyName} (${industry}) 的穿透审议专项结果汇总**

${includeSummary ? "#### 一、 现场尽调审计大盘及基本面核验状况\n通过穿透工作分析底稿，标的赛道属性为 " + industry + "。核心业务简介: " + description + "。现场结合活动账目验证综合状况极高、且配合对非标设备的物理盘点。" : ""}

${includeAssets ? "#### 二、 固定及流片设备权证属地及无形资产审计\n对于掩膜版、流片寄存代工厂发票保管核审，以及对应研发资本化账务重合点排查。对可能触发专利侵权或者出海风波的底层抗辩逻辑。" : ""}

${includeRedFlags ? "#### 三、 严重红旗及表外债务清偿隐患 (Red Flags)\n重点列出该标的整体属于【" + riskLevel + "】风险水平。针对大股东对赌连带危机、应收账款拉长坏账核验充分性、潜在股份代持冲突给出高精度暴险提示。" : ""}

${includePrecautionary ? "#### 四、 交易文件防御性整改及SPA买方特许条款建议\n明确建议买方PE在SPA/SHA中加入以下防守：\n1. 约定分期（tranche）注资触发门槛；\n2. 创始人全财产连带保证；\n3. 第一顺位回购权与核心大额流片一票否决限制细节。" : ""}

切记：必须输出纯粹和真实的格式化报告，体现高度专业的投资学词汇，不要有任何客套和前言后语。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    res.json({ memo: response.text });
  } catch (error: any) {
    console.error("Error generating diligence memo:", error);
    res.status(500).json({ error: error.message || "Failed to generate report memo" });
  }
});

// Vite server configuration logic
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}/ in ${process.env.NODE_ENV || "development"} mode`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start fullstack server:", err);
});
