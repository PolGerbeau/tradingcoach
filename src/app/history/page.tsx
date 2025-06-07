"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";

interface SupportResistance {
  level: string;
  type: "Support" | "Resistance";
  reason: string;
}

interface Analysis {
  id: string;
  date: string;
  chartImage: string;
  profileSnapshot: any;
  ticker: string;
  price: string;
  timeframe: string;
  recommendation: string;
  reasoning: string;
  supportResistance?: SupportResistance[];
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
    if (rec === "BUY") return "text-green-600";
    if (rec === "SELL") return "text-red-600";
    return "text-yellow-600";
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
        Analysis
      </h1>

      {history.length === 0 ? (
        <p className="text-center text-gray-500">No analysis yet.</p>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearAll}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-sm"
            >
              Clear All Analysis
            </button>
          </div>

          <div className="rounded-xl overflow-hidden shadow border border-gray-200">
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Ticker</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Timeframe</th>
                  <th className="py-3 px-4 text-left">Recommendation</th>
                  <th className="py-3 px-4 text-left"></th>
                  <th className="py-3 px-4 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-600">
                      {entry.date.split("T")[0]}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{entry.ticker}</td>
                    <td className="py-3 px-4 text-gray-600">{entry.price}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {entry.timeframe}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span
                        className={`uppercase ${getColorClass(
                          entry.recommendation
                        )}`}
                      >
                        {entry.recommendation}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openModal(entry)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl transition-all space-y-4 max-h-[80vh] overflow-y-auto">
            {selected && (
              <>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-gray-800">
                    {selected.ticker}
                  </p>
                  <button
                    onClick={closeModal}
                    aria-label="Close"
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <img
                  src={selected.chartImage}
                  alt="Chart"
                  className="w-full rounded-xl border shadow"
                />

                <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700 shadow space-y-2">
                  <div className="text-left space-y-4">
                    <div>
                      <p className="font-bold text-gray-900 mb-1">
                        Recommendation: {selected.recommendation}
                      </p>
                      <p className="text-sm">{selected.reasoning}</p>
                    </div>
                  </div>

                  {selected.supportResistance?.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-800 mb-1">
                        Support/Resistance Levels:
                      </p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {selected.supportResistance.map((s, idx) => (
                          <li key={idx}>
                            <span className="font-medium">
                              {s.type} @ {s.level}:
                            </span>{" "}
                            {s.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {selected.profileSnapshot && (
                  <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700 shadow space-y-2">
                    <p className="font-semibold text-gray-800">
                      Trader Profile
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {Object.entries(selected.profileSnapshot).map(
                        ([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-gray-500 font-medium capitalize">
                              {key}
                            </p>
                            <p className="text-gray-900">
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
