import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ProjectList from "./components/ProjectList";
import ProjectDetail from "./components/ProjectDetail";
import SpecialChecks from "./components/SpecialChecks";
import DocumentArchive from "./components/DocumentArchive";
import RiskAssessment from "./components/RiskAssessment";
import ReportGenerator from "./components/ReportGenerator";
import AICopilot from "./components/AICopilot";

import { INITIAL_PROJECTS, MOCK_ARCHIVED_FILES } from "./data";
import { DDProject, ArchivedDoc } from "./types";
import { ClipboardList, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";

export default function App() {
  // 1. Core State
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [projects, setProjects] = useState<DDProject[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>("proj_1");
  const [documents, setDocuments] = useState<ArchivedDoc[]>(MOCK_ARCHIVED_FILES);
  const [showAICopilotPanel, setShowAICopilotPanel] = useState(false);

  // Switch project handler
  const handleSelectProject = (projId: string) => {
    setActiveProjectId(projId);
    setActiveTab("project-detail"); // Jump directed to detail process
  };

  // RECACULATE COMPLETENESS ON-THE-FLY
  const recalculateCompleteness = (checklists: typeof INITIAL_PROJECTS[0]["checklists"]) => {
    const total = checklists.length;
    if (total === 0) return 0;
    const completed = checklists.filter(item => item.status === "已审核" || item.status === "已收集待审计").length;
    return Math.round((completed / total) * 100);
  };

  // Update specific checklist item fields
  const handleUpdateProjectChecklist = (projId: string, itemId: string, updatedFields: any) => {
    setProjects(prevProjects => {
      return prevProjects.map(proj => {
        if (proj.id !== projId) return proj;

        const updatedChecklists = proj.checklists.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, ...updatedFields };
        });

        const newCompleteness = recalculateCompleteness(updatedChecklists);

        return {
          ...proj,
          checklists: updatedChecklists,
          completeness: newCompleteness
        };
      });
    });
  };

  // Register uploaded files into global files list on-the-fly
  const handleSimulateArchiveDoc = (projId: string, fileName: string, category: string, notes: string) => {
    const newDoc: ArchivedDoc = {
      id: `manual_doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      projectId: projId,
      fileName,
      category: category as any,
      uploadDate: new Date().toISOString().split("T")[0],
      uploader: "现场尽调组-段志华",
      size: `${(Math.random() * 4 + 1).toFixed(1)} MB`,
      isVerified: false,
      notes
    };
    setDocuments(prev => [newDoc, ...prev]);
  };

  // Verify / stamp file handler
  const handleVerifyDoc = (docId: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== docId) return doc;
      return { ...doc, isVerified: !doc.isVerified };
    }));
  };

  // Delete file out of register
  const handleDeleteDoc = (docId: string) => {
    if (confirm("是否确定将此穿透材料在底册归档中逻辑移出？物理移出不可撤销。")) {
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    }
  };

  // Add manual file document entries
  const handleAddManualDoc = (projId: string, name: string, category: string, size: string, uploader: string) => {
    const newDoc: ArchivedDoc = {
      id: `manual_doc_${Date.now()}`,
      projectId: projId,
      fileName: name,
      category: category as any,
      uploadDate: new Date().toISOString().split("T")[0],
      uploader,
      size,
      isVerified: false,
      notes: "投资人员手动追加的补充背景底册资料。"
    };
    setDocuments(prev => [newDoc, ...prev]);
  };

  // Apply AI Compiled checklist categories to project
  const handleApplyAIChecklist = (projId: string, categories: any[]) => {
    setProjects(prevProjects => {
      return prevProjects.map(proj => {
        if (proj.id !== projId) return proj;

        // Map AI format to ChecklistItem format
        let idCounter = 1;
        const newChecklists: typeof INITIAL_PROJECTS[0]["checklists"] = [];

        categories.forEach(cat => {
          cat.items.forEach((item: any) => {
            newChecklists.push({
              id: `ai_${projId}_${cat.name}_${idCounter++}`,
              category: cat.name as any,
              title: item.title,
              description: item.description,
              importance: item.importance as any,
              status: "未开始",
              assignee: "AI推荐协助人",
              sourceDocs: item.sourceDocs || []
            });
          });
        });

        const newCompleteness = recalculateCompleteness(newChecklists);

        return {
          ...proj,
          checklists: newChecklists,
          completeness: newCompleteness
        };
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-gray-800">
      
      {/* 1. Global Navigation Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. Primary Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Tab router views */}
        {activeTab === "dashboard" && (
          <Dashboard
            projects={projects}
            onSelectProject={handleSelectProject}
            totalDocsCount={documents.length}
          />
        )}

        {activeTab === "project-list" && (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            onAddProject={(newProj) => setProjects(prev => [...prev, newProj])}
          />
        )}

        {activeTab === "project-detail" && (
          <ProjectDetail
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onUpdateProjectFields={(projId, fields) => setProjects(prev => prev.map(p => p.id === projId ? { ...p, ...fields } : p))}
          />
        )}

        {activeTab === "special-checks" && (
          <SpecialChecks
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onUpdateProjectChecklist={handleUpdateProjectChecklist}
            onSimulateArchiveDoc={handleSimulateArchiveDoc}
          />
        )}

        {activeTab === "archive" && (
          <DocumentArchive
            documents={documents}
            projects={projects}
            onVerifyDoc={handleVerifyDoc}
            onDeleteDoc={handleDeleteDoc}
            onAddManualDoc={handleAddManualDoc}
          />
        )}

        {activeTab === "risk-assessment" && (
          <RiskAssessment
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onUpdateProjectFields={(projId, fields) => setProjects(prev => prev.map(p => p.id === projId ? { ...p, ...fields } : p))}
          />
        )}

        {activeTab === "report-generator" && (
          <ReportGenerator
            projects={projects}
            documents={documents}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
          />
        )}

        {/* Floating Copilot Trigger and Sliding Drawer */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
          {showAICopilotPanel && (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] overflow-hidden flex flex-col transition-all duration-300 transform animate-fade-in-up">
              <div className="bg-teal-600 px-4 py-3 text-white flex justify-between items-center shrink-0">
                <span className="text-xs font-black flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse text-amber-300" />
                  <span>Gemini 现场实时穿透诊断官</span>
                </span>
                <button
                  onClick={() => setShowAICopilotPanel(false)}
                  className="text-white hover:text-neutral-200 text-xs font-bold leading-none p-1 cursor-pointer"
                >
                  ✕ 关闭 
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                <AICopilot
                  projects={projects}
                  activeProjectId={activeProjectId}
                  onApplyAIChecklist={handleApplyAIChecklist}
                />
              </div>
            </div>
          )}

          <button
            id="float-ai-copilot"
            onClick={() => setShowAICopilotPanel(prev => !prev)}
            className="flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-full px-5 py-3 shadow-xl hover:scale-105 active:scale-95 transition-all text-xs font-black cursor-pointer uppercase tracking-wider relative group"
          >
            <Sparkles className="h-4.5 w-4.5 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <span>AI 大智囊协助</span>
            <span className="absolute -top-1 -left-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>
        </div>

      </main>

      {/* 4. Elegant footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12 text-center text-3xs text-gray-400 space-y-1">
        <p className="font-semibold text-gray-500 flex items-center justify-center">
          <ShieldAlert className="h-3 w-3 text-red-500 mr-1" />
          <span>私募股权投资尽调合规协作控制面板 · 面向非上市投资机构</span>
        </p>
        <p>本项目按照国家非对称非标投资风控指导意见研制，整合盖章校验审计链和 AI 智能穿透校验体系。</p>
        <p className="font-mono text-[9px] mt-2">UTC: 2026-05-21 02:55:00 · Admin: jichuanghan@gmail.com</p>
      </footer>

    </div>
  );
}
