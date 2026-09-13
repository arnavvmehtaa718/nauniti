"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Loader2,
  Send,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import api from "@/services/api";
import { AI_SUGGESTIONS } from "@/lib/mockData";
import { useAppStore } from "@/store/useAppStore";
import type { ReactNode } from "react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  actions?: string[];
}

let mid = 1;

export default function AiAssistantPage() {
  const router = useRouter();
  const pushToast = useAppStore((s) => s.pushToast);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: `Welcome! I'm **NauNiti Copilot**, your chartering decision assistant for the *Coal · 70,000 t · Hay Point → Paradip* program.\n\nAsk me anything about freight outlook, vessel fit, port congestion, contract strategy or total cost — or pick a suggested prompt below.`,
      actions: ["View Final Recommendation", "Run Simulation"],
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setInput("");
    setMessages((m) => [...m, { id: mid++, role: "user", content: q }]);
    setTyping(true);
    const res = await api.askAssistant(q);
    setTyping(false);
    setMessages((m) => [
      ...m,
      { id: mid++, role: "assistant", content: res.answer, actions: res.actions },
    ]);
  };

  const runAction = (action: string) => {
    const route: Record<string, string> = {
      "View Vessel Details": "/vessels",
      "Run Simulation": "/simulation",
      "Compare Vessels": "/vessels",
      "View Port Constraints": "/ports",
      "View Freight Forecast": "/forecast",
      "Run What-If Simulation": "/simulation",
      "View Risk Assessment": "/risk",
      "View Port Analytics": "/ports",
      "Compare All Ports": "/ports",
      "View Route Optimization": "/routes",
      "View Risk Center": "/risk",
      "View Contract Strategy": "/contracts",
      "View Cost & Savings": "/cost-savings",
      "Generate Report": "/reports",
      "View Recommendation": "/recommendation",
      "View Final Recommendation": "/recommendation",
    };
    if (route[action]) {
      router.push(route[action]);
    } else {
      pushToast({ kind: "info", title: action, description: "Contextual action triggered by NauNiti Copilot." });
    }
  };

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        subtitle="Domain-tuned chartering copilot — analyzes your live scenario and proposes contextual next actions."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <ChartCard
          title="Conversation"
          subtitle="NauNiti Copilot · knowledge-base demo"
          className="xl:col-span-3"
        >
          <div ref={scrollRef} className="flex h-[520px] flex-col gap-3 overflow-y-auto pr-1">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onAction={runAction} />
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
                  <Bot className="size-4" />
                </span>
                <div className="rounded-xl rounded-bl-sm border border-line bg-panel px-3 py-2.5">
                  <Loader2 className="size-4 animate-spin text-accent" />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
            {AI_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={typing}
                className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-2 py-1 text-[11px] text-secondary transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50"
              >
                <Zap className="size-3 text-accent" /> {s}
              </button>
            ))}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-panel p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about freight, vessels, ports, contracts, risk…"
              className="h-9 flex-1 bg-transparent px-2 text-[13px] text-primary placeholder:text-secondary/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-nav text-white transition-colors hover:bg-blue-glow disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </form>
        </ChartCard>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-accent/35 bg-card p-4">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
              <Sparkles className="size-3.5" /> Context aware
            </div>
            <h3 className="text-[13px] font-semibold text-primary">Answers grounded in your scenario</h3>
            <ul className="mt-2 space-y-1.5 text-[11.5px] text-secondary">
              <li>• Current scenario: Coal · 70,000 t · 4 voyages</li>
              <li>• Live forecast: +11.5% on a 30-day view</li>
              <li>• Recommended vessel: Panamax (87/100)</li>
              <li>• Current risk score: 62/100 (Medium)</li>
            </ul>
            <button
              onClick={() => router.push("/recommendation")}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-nav py-2 text-[12px] font-medium text-white transition-colors hover:bg-blue-glow"
            >
              See decision brief <ArrowRight className="size-3.5" />
            </button>
          </div>

          <div className="rounded-xl border border-line bg-card p-4 text-[11.5px] leading-relaxed text-secondary">
            <h4 className="mb-1.5 text-[12px] font-semibold text-primary">Capabilities</h4>
            <p>• Explain recommendations &amp; drivers</p>
            <p>• Compare ports and vessels</p>
            <p>• Sensitivity &amp; congestion impact</p>
            <p>• Contract strategy rationale</p>
            <p>• Cost estimation at program level</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onAction,
}: {
  message: Message;
  onAction: (a: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg ${
          isUser ? "bg-white/5 text-secondary" : "bg-accent/15 text-accent"
        }`}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </span>
      <div
        className={`max-w-[85%] rounded-xl border px-3.5 py-2.5 ${
          isUser ? "rounded-br-sm border-accent/40 bg-accent/10" : "rounded-bl-sm border-line bg-panel"
        }`}
      >
        <Markdown text={message.content} />
        {message.actions && message.actions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {message.actions.map((a) => (
              <button
                key={a}
                onClick={() => onAction(a)}
                className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/20"
              >
                {a}
                <ArrowRight className="size-3" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let tableBuf: string[] = [];

  const flushTable = () => {
    if (tableBuf.length === 0) return;
    nodes.push(renderTable(tableBuf));
    tableBuf = [];
  };

  const lines = text.split("\n");
  lines.forEach((line) => {
    if (line.trim().startsWith("|")) {
      tableBuf.push(line);
    } else {
      flushTable();
      nodes.push(renderBlock(line));
    }
  });
  flushTable();

  return <div className="space-y-2 text-[12.5px] leading-relaxed text-primary">{nodes}</div>;

  function renderTable(rows: string[]) {
    const cells = rows.map((r) =>
      r
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => c.trim())
    );
    const bodyRows = cells.filter((r) => !r.some((c) => /^[-:]+$/.test(c)));
    const header = bodyRows[0] ?? [];
    const rest = bodyRows.slice(1);
    return (
      <div key={rows.join("")} className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-panel">
              {header.map((h, i) => (
                <th key={i} className="border-b border-line px-2.5 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-secondary">
                  {inline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rest.map((r, i) => (
              <tr key={i} className="border-b border-line/60 last:border-0">
                {r.map((c, j) => (
                  <td key={j} className="px-2.5 py-1.5 text-primary">{inline(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderBlock(line: string) {
    const t = line.trim();
    if (!t) return null;
    if (/^#{1,3}\s/.test(t)) {
      return (
        <p key={line} className="text-[13.5px] font-semibold text-primary">
          {inline(t.replace(/^#{1,3}\s/, ""))}
        </p>
      );
    }
    if (/^[-*]\s/.test(t)) {
      return (
        <div key={line} className="flex items-start gap-2 pl-1 text-secondary">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
          <span>{inline(t.replace(/^[-*]\s/, ""))}</span>
        </div>
      );
    }
    if (/^\d+\.\s/.test(t)) {
      return (
        <div key={line} className="flex items-start gap-2 pl-1 text-secondary">
          <span className="shrink-0 font-semibold text-accent">{t.match(/^\d+/)![0]}.</span>
          <span>{inline(t.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
    }
    if (/^\*.+:/.test(t)) {
      return (
        <p key={line} className="text-secondary italic">
          {inline(t)}
        </p>
      );
    }
    return <p key={line} className="text-[12.5px] text-secondary">{inline(t)}</p>;
  }

  function inline(s: string): ReactNode[] {
    const parts = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-primary">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return (
          <em key={i} className="italic text-[12.5px]">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  }
}