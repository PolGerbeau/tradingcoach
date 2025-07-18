"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { useSearchParams } from "next/navigation";
import { X, ArrowUp, ArrowDown, Pause } from "lucide-react";
import {
  Brain,
  Upload,
  BarChart2,
  MessageCircle,
  Menu,
  User,
} from "lucide-react";

interface SupportResistance {
  level: string;
  type: "Support" | "Resistance";
  reason: string;
}

interface LLMAnalysis {
  id: string;
  source: string;
  ticker: string;
  price: string;
  timeframe: string;
  recommendation: string;
  reasoning: string;
  supportResistance?: SupportResistance[];
}

interface Analysis {
  id: string;
  date: string;
  chartImage: string;
  profileSnapshot: any;
  analyses: LLMAnalysis[];
}

export default function HistoryPage() {
  const [history, setHistory] = useState<Analysis[]>([]);
  const [selected, setSelected] = useState<Analysis | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const stored = localStorage.getItem("tradingcoach_history");
    if (stored) {
      const parsed = JSON.parse(stored);
      setHistory(parsed);

      const idFromUrl = searchParams.get("id");
      if (idFromUrl) {
        const found = parsed.find((entry: Analysis) => entry.id === idFromUrl);
        if (found) {
          setSelected(found);
          setIsOpen(true);
        }
      }
    }
  }, [searchParams]);

  const handleDelete = (id: string) => {
    const updated = history.filter((entry) => entry.id !== id);
    setHistory(updated);
    localStorage.setItem("tradingcoach_history", JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all analysis?")) {
      setHistory([]);
      localStorage.removeItem("tradingcoach_history");
    }
  };

  const openModal = (entry: Analysis) => {
    setSelected(entry);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelected(null);
  };

  const getColorClass = (rec: string) => {
    switch (rec) {
      case "BUY":
        return "text-[#00ff33] bg-[#00ff33]/20 shadow-[0_0_5px_#00ff33]";
      case "SELL":
        return "text-[#ff3333] bg-[#ff3333]/20 shadow-[0_0_5px_#ff3333]";
      case "HOLD":
        return "text-[#ffff33] bg-[#ffff33]/20 shadow-[0_0_5px_#ffff33]";
      default:
        return "text-[#00ff88] bg-[#00ff88]/20 shadow-[0_0_5px_#00ff88]";
    }
  };

  const getIcon = (rec: string) => {
    switch (rec) {
      case "BUY":
        return <ArrowUp className="w-5 h-5 inline mr-1 text-[#00ff33]" />;
      case "SELL":
        return <ArrowDown className="w-5 h-5 inline mr-1 text-[#ff3333]" />;
      case "HOLD":
        return <Pause className="w-5 h-5 inline mr-1 text-[#ffff33]" />;
      default:
        return null;
    }
  };

  return (
    <main className="w-full px-4 sm:px-6 py-16 ">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-4xl font-extrabold text-[#00ff88] mb-6 flex items-center gap-2 ">
          <BarChart2 className="w-8 h-8 text-[#00ff88]" />
          Analysis
        </h1>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="absolute top-25 right-15 bg-gradient-to-r from-[#00ff88] to-[#00cc70] text-black px-4 py-2 rounded-xl shadow-[0_0_10px_#00ff88] hover:shadow-[0_0_15px_#00ff88] transition-all duration-200 text-sm"
          >
            Clear All Analysis
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-center text-gray-200">No analysis yet.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-auto text-sm border border-[#00ff88] rounded-lg shadow-[0_0_10px_rgba(0,255,136,0.3)] bg-[#1a1a1a]">
              <thead className="bg-[#1a1a1a] text-gray-200 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Ticker</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Timeframe</th>
                  <th className="py-3 px-4 text-left">Recommendations</th>
                  <th className="py-3 px-4 text-left"></th>
                  <th className="py-3 px-4 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00ff88]/30">
                {history
                  .filter(
                    (entry) =>
                      Array.isArray(entry.analyses) && entry.analyses.length > 0
                  )
                  .map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-[#00ff88]/10 transition"
                    >
                      <td className="py-3 px-4 text-gray-200">
                        {entry.date.split("T")[0]}
                      </td>
                      <td className="py-3 px-4 text-gray-200">
                        {entry.analyses?.[0]?.ticker || "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-200">
                        {entry.analyses?.[0]?.price || "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-200">
                        {entry.analyses?.[0]?.timeframe || "-"}
                      </td>
                      <td className="py-3 px-4 font-semibold flex flex-wrap gap-1">
                        {entry.analyses.map((a) => (
                          <span
                            key={a.id}
                            className={`inline-flex items-center m-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getColorClass(
                              a.recommendation
                            )}`}
                            title={`${a.source}: ${a.recommendation}`}
                          >
                            {getIcon(a.recommendation)}
                            {a.source}: {a.recommendation}
                          </span>
                        ))}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openModal(entry)}
                          className="text-[#00ff88] hover:bg-[#00ff88]/20 font-medium rounded px-2 py-1 transition"
                        >
                          View
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-[#00ff88] hover:bg-[#00ff88]/20 font-medium rounded px-2 py-1 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {history
              .filter(
                (entry) =>
                  Array.isArray(entry.analyses) && entry.analyses.length > 0
              )
              .map((entry) => (
                <div
                  key={entry.id}
                  className="border border-[#00ff88] rounded-lg shadow-[0_0_10px_rgba(0,255,136,0.3)] p-4 bg-[#1a1a1a]"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-semibold text-[#00ff88]">Date</div>
                    <div className="text-gray-200">
                      {entry.date.split("T")[0]}
                    </div>
                    <div className="font-semibold text-[#00ff88]">Ticker</div>
                    <div className="text-gray-200">
                      {entry.analyses?.[0]?.ticker || "-"}
                    </div>
                    <div className="font-semibold text-[#00ff88]">Price</div>
                    <div className="text-gray-200">
                      {entry.analyses?.[0]?.price || "-"}
                    </div>
                    <div className="font-semibold text-[#00ff88]">
                      Timeframe
                    </div>
                    <div className="text-gray-200">
                      {entry.analyses?.[0]?.timeframe || "-"}
                    </div>
                    <div className="font-semibold text-[#00ff88]">
                      Recommendations
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.analyses.map((a) => (
                        <span
                          key={a.id}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getColorClass(
                            a.recommendation
                          )}`}
                        >
                          {getIcon(a.recommendation)}
                          {a.source}: {a.recommendation}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      onClick={() => openModal(entry)}
                      className="text-[#00ff88] hover:bg-[#00ff88]/20 font-medium rounded px-2 py-1 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-[#00ff88] hover:bg-[#00ff88]/20 font-medium rounded px-2 py-1 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-[#1a1a1a]/95 backdrop-blur-sm p-6 shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all space-y-6 max-h-[85vh] overflow-y-auto neon-border">
            {selected && (
              <>
                <div className="bg-gradient-to-r from-[#00ff88] to-[#00cc70] text-black p-4 rounded-t-2xl shadow-[0_0_10px_#00ff88] flex justify-between items-center">
                  <h2 className="text-xl font-bold ">
                    {selected.analyses?.[0]?.ticker || ""}
                  </h2>
                  <button
                    onClick={closeModal}
                    aria-label="Close"
                    className="text-gray-200 hover:text-white transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff88] to-[#00cc70] rounded-lg blur opacity-20" />
                  <img
                    src={selected.chartImage}
                    alt="Chart"
                    className="w-full rounded-lg border-2 border-[#00ff88] relative shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                  />
                </div>

                {selected.analyses.map((a) => (
                  <div
                    key={a.id}
                    className="bg-[#1a1a1a] border-t border-[#00ff88]/30 rounded-lg p-4 text-gray-200 shadow-inner space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-[#00ff88] ">
                        {a.source} Recommendation: {a.recommendation}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full ${getColorClass(
                          a.recommendation
                        )}`}
                      >
                        {getIcon(a.recommendation)}
                        <span className="uppercase">{a.recommendation}</span>
                      </span>
                    </div>
                    <p className="text-base leading-relaxed text-gray-200">
                      {a.reasoning}
                    </p>
                    {a.supportResistance && a.supportResistance.length > 0 && (
                      <div>
                        <p className="text-base font-semibold text-[#00ff88] mt-2">
                          Support/Resistance Levels:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-200">
                          {a.supportResistance.map((s, idx) => (
                            <li key={idx} className="text-base">
                              <span className="font-medium text-[#00ff88]">
                                {s.type} @ {s.level}:
                              </span>{" "}
                              {s.reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                {selected.profileSnapshot && (
                  <div className="bg-[#1a1a1a] border-t border-[#00ff88]/30 rounded-lg p-4 text-gray-200 shadow-inner space-y-4">
                    <h3 className="text-lg font-semibold text-[#00ff88] ">
                      Trader Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-base">
                      {Object.entries(selected.profileSnapshot).map(
                        ([key, value]) => (
                          <div key={key} className="flex flex-col">
                            <p className="text-sm font-medium text-[#00ff88] capitalize">
                              {key}
                            </p>
                            <p className="text-gray-200">
                              {Array.isArray(value)
                                ? value.join(", ")
                                : typeof value === "string"
                                ? value
                                : JSON.stringify(value)}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </main>
  );
}
