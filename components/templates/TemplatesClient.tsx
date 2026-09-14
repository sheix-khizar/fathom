"use client";

import { useState } from "react";
import Link from "next/link";
import { SummaryTemplate } from "@/lib/types";

interface TemplatesClientProps {
  templates: SummaryTemplate[];
}

// Visual icons and sample structure per template
const TEMPLATE_METADATA: Record<
  string,
  {
    iconBg: string;
    iconColor: string;
    category: string;
    sections: string[];
    sampleSnippet: string;
  }
> = {
  "one-on-one": {
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    category: "Management",
    sections: ["Key Wins & Motivation", "Priorities Alignment", "Blockers & Escalations", "Agreed Next Steps"],
    sampleSnippet: "Identified engineering velocity impediment on DB connections; approved 1-week focus sprint.",
  },
  "weekly-team-sync": {
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    category: "Team Operations",
    sections: ["Sprint Highlights", "Cross-Team Dependencies", "Milestone Tracking", "Open Action Items"],
    sampleSnippet: "Diarization pipeline latency reduced to 420ms. PgBouncer staged for Monday morning peak.",
  },
  "customer-discovery": {
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    category: "Product & Research",
    sections: ["Problem Context", "Current Workarounds", "Feature Desirability", "Budget & Timeline"],
    sampleSnippet: "Acme conducts 450 calls/wk; requires EU data residency and 0-auth public clip sharing for designers.",
  },
  "sales-call": {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    category: "Sales & Revenue",
    sections: ["Prospect Motivation", "Objection Handling", "Competitor Comparison", "Commercial Next Steps"],
    sampleSnippet: "Evaluating 25 PM pilot seats; follow-up architecture review scheduled with InfoSec for Wednesday.",
  },
  "interview": {
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-400",
    category: "Hiring & Talent",
    sections: ["Technical Competency", "System Architecture", "Cultural Fit & Values", "Hiring Recommendation"],
    sampleSnippet: "Demonstrated strong distributed systems knowledge; recommended Strong Hire for Staff Platform role.",
  },
  "project-kickoff": {
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    category: "Project Management",
    sections: ["Project Goals & Scope", "RACI & Deliverables", "Known Risks", "Communication Cadence"],
    sampleSnippet: "Product Hunt launch locked for Oct 6th at 00:01 PST; developer newsletter sponsorships approved.",
  },
  "executive-brief": {
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    category: "Executive & Board",
    sections: ["Strategic Takeaway", "Resource Impact", "Key Decisions Finalized", "Leadership Action Items"],
    sampleSnippet: "Prioritize public clip workflow for Q4; sunset legacy audio pipeline in favor of Deepgram nova-2.",
  },
};

export default function TemplatesClient({ templates }: TemplatesClientProps) {
  const [activeTemplateId, setActiveTemplateId] = useState<string>("executive-brief");
  const [appliedTemplateId, setAppliedTemplateId] = useState<string>("executive-brief");

  const selectedTemplate =
    templates.find((t) => t.id === activeTemplateId) || templates[0];
  const meta = TEMPLATE_METADATA[selectedTemplate.id] || {
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    category: "General",
    sections: ["Overview", "Key Points", "Decisions"],
    sampleSnippet: "General meeting intelligence summary.",
  };

  const handleApply = (id: string) => {
    setAppliedTemplateId(id);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            AI Summary Templates
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Customize how Fathom extracts summaries, action items, and key decisions for different call formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 border border-indigo-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Active Default: {templates.find((t) => t.id === appliedTemplateId)?.name}
          </span>
        </div>
      </div>

      {/* Grid: Templates List (left) + Live Structure Preview (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Templates Cards Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((template) => {
            const isSelected = template.id === activeTemplateId;
            const isApplied = template.id === appliedTemplateId;
            const tMeta = TEMPLATE_METADATA[template.id] || {
              iconBg: "bg-gray-800",
              iconColor: "text-gray-400",
              category: "General",
              sections: ["Overview", "Key Points", "Decisions"],
              sampleSnippet: "",
            };

            return (
              <div
                key={template.id}
                onClick={() => setActiveTemplateId(template.id)}
                className={`group flex flex-col justify-between rounded-xl border p-4 transition cursor-pointer ${
                  isSelected
                    ? "border-indigo-500 bg-gray-900/90 shadow-md ring-1 ring-indigo-500/30"
                    : "border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900/80"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${tMeta.iconBg} ${tMeta.iconColor}`}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-100 group-hover:text-indigo-300 transition">
                          {template.name}
                        </h3>
                        <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
                          {tMeta.category}
                        </span>
                      </div>
                    </div>

                    {isApplied && (
                      <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">
                    {tMeta.sections.length} core sections
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(template.id);
                      setActiveTemplateId(template.id);
                    }}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                      isApplied
                        ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-gray-800 text-gray-300 hover:bg-indigo-600 hover:text-white"
                    }`}
                  >
                    {isApplied ? "Applied ✓" : "Use template"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Template Details / AI Structure Preview (right) */}
        <div className="lg:col-span-5 rounded-xl border border-gray-800 bg-gray-900/70 p-6 shadow-sm space-y-5 sticky top-6">
          <div className="flex items-start justify-between border-b border-gray-800 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Template Preview
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {selectedTemplate.name}
              </h2>
            </div>

            <button
              onClick={() => handleApply(selectedTemplate.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                appliedTemplateId === selectedTemplate.id
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow"
              }`}
            >
              {appliedTemplateId === selectedTemplate.id ? "Applied as Default" : "Set as Default"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-1">
                Description
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                {selectedTemplate.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
                Extracted Intelligence Sections
              </h4>
              <div className="space-y-1.5">
                {meta.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg bg-gray-950/60 px-3 py-2 text-xs text-gray-300 border border-gray-800"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-800 text-[10px] font-mono text-gray-400">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-200">{sec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-3.5 space-y-1.5">
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
                Sample AI Output Highlight
              </span>
              <p className="text-xs text-indigo-200 italic leading-relaxed">
                &ldquo;{meta.sampleSnippet}&rdquo;
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/meetings"
                className="block text-center rounded-lg border border-gray-800 bg-gray-800/60 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition"
              >
                Apply to a Recorded Meeting →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
