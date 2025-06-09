"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HistoryPage;
const react_1 = require("react");
const react_2 = require("@headlessui/react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
function HistoryPage() {
    var _a, _b;
    const [history, setHistory] = (0, react_1.useState)([]);
    const [selected, setSelected] = (0, react_1.useState)(null);
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const searchParams = (0, navigation_1.useSearchParams)();
    (0, react_1.useEffect)(() => {
        const stored = localStorage.getItem("tradingcoach_history");
        if (stored) {
            const parsed = JSON.parse(stored);
            setHistory(parsed);
            const idFromUrl = searchParams.get("id");
            if (idFromUrl) {
                const found = parsed.find((entry) => entry.id === idFromUrl);
                if (found) {
                    setSelected(found);
                    setIsOpen(true);
                }
            }
        }
    }, [searchParams]);
    const handleDelete = (id) => {
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
    const openModal = (entry) => {
        setSelected(entry);
        setIsOpen(true);
    };
    const closeModal = () => {
        setIsOpen(false);
        setSelected(null);
    };
    const getColorClass = (rec) => {
        if (rec === "BUY")
            return "text-green-600 bg-gradient-to-br from-green-100 to-green-200";
        if (rec === "SELL")
            return "text-red-600 bg-gradient-to-br from-red-100 to-red-200";
        return "text-yellow-600 bg-gradient-to-br from-yellow-100 to-yellow-200";
    };
    const getIcon = (rec) => {
        switch (rec) {
            case "BUY":
                return <lucide_react_1.ArrowUp className="w-5 h-5 inline mr-1"/>;
            case "SELL":
                return <lucide_react_1.ArrowDown className="w-5 h-5 inline mr-1"/>;
            case "HOLD":
                return <lucide_react_1.Pause className="w-5 h-5 inline mr-1"/>;
            default:
                return null;
        }
    };
    return (<main className="w-full px-4 sm:px-6 py-20">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-blue-800 text-center sm:text-left w-full sm:w-auto">
          Analysis
        </h1>
        {history.length > 0 && (<button onClick={handleClearAll} className="absolute top-6 right-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-200 text-sm">
            Clear All Analysis
          </button>)}
      </div>

      {history.length === 0 ? (<p className="text-center text-gray-500">No analysis yet.</p>) : (<>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-auto text-sm border border-gray-200 rounded-lg shadow">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
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
              <tbody className="divide-y divide-gray-200">
                {history
                .filter((entry) => Array.isArray(entry.analyses) && entry.analyses.length > 0)
                .map((entry) => {
                var _a, _b, _c, _d, _e, _f;
                return (<tr key={entry.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-gray-600">
                        {entry.date.split("T")[0]}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {((_b = (_a = entry.analyses) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.ticker) || "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {((_d = (_c = entry.analyses) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.price) || "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {((_f = (_e = entry.analyses) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.timeframe) || "-"}
                      </td>
                      <td className="py-3 px-4 font-semibold flex flex-wrap gap-1">
                        {entry.analyses.map((a) => (<span key={a.id} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getColorClass(a.recommendation)}`} title={`${a.source}: ${a.recommendation}`}>
                            {getIcon(a.recommendation)}
                            {a.source}: {a.recommendation}
                          </span>))}
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={() => openModal(entry)} className="text-blue-600 hover:underline font-medium">
                          View
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:underline font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>);
            })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {history
                .filter((entry) => Array.isArray(entry.analyses) && entry.analyses.length > 0)
                .map((entry) => {
                var _a, _b, _c, _d, _e, _f;
                return (<div key={entry.id} className="border border-gray-200 rounded-lg shadow p-4 bg-white">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-semibold text-gray-600">Date</div>
                    <div>{entry.date.split("T")[0]}</div>
                    <div className="font-semibold text-gray-600">Ticker</div>
                    <div>{((_b = (_a = entry.analyses) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.ticker) || "-"}</div>
                    <div className="font-semibold text-gray-600">Price</div>
                    <div>{((_d = (_c = entry.analyses) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.price) || "-"}</div>
                    <div className="font-semibold text-gray-600">Timeframe</div>
                    <div>{((_f = (_e = entry.analyses) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.timeframe) || "-"}</div>
                    <div className="font-semibold text-gray-600">
                      Recommendations
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.analyses.map((a) => (<span key={a.id} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getColorClass(a.recommendation)}`}>
                          {getIcon(a.recommendation)}
                          {a.source}: {a.recommendation}
                        </span>))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-4">
                    <button onClick={() => openModal(entry)} className="text-blue-600 hover:underline font-medium">
                      View
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:underline font-medium">
                      Delete
                    </button>
                  </div>
                </div>);
            })}
          </div>
        </>)}

      <react_2.Dialog open={isOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true"/>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <react_2.Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-2xl transition-all space-y-6 max-h-[85vh] overflow-y-auto">
            {selected && (<>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl shadow-lg flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {((_b = (_a = selected.analyses) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.ticker) || ""}
                  </h2>
                  <button onClick={closeModal} aria-label="Close" className="text-white hover:text-gray-200 transition">
                    <lucide_react_1.X className="w-6 h-6"/>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg blur opacity-20"/>
                  <img src={selected.chartImage} alt="Chart" className="w-full rounded-lg border-2 border-transparent relative"/>
                </div>

                {selected.analyses.map((a) => (<div key={a.id} className="bg-gray-50 border-t border-gray-200 rounded-lg p-4 text-gray-700 shadow-inner space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {a.source} Recommendation: {a.recommendation}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full ${getColorClass(a.recommendation)}`}>
                        {getIcon(a.recommendation)}
                        <span className="uppercase">{a.recommendation}</span>
                      </span>
                    </div>
                    <p className="text-base leading-relaxed">{a.reasoning}</p>
                    {a.supportResistance && a.supportResistance.length > 0 && (<div>
                        <p className="text-base font-semibold mt-2">
                          Support/Resistance Levels:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          {a.supportResistance.map((s, idx) => (<li key={idx} className="text-base">
                              <span className="font-medium">
                                {s.type} @ {s.level}:
                              </span>{" "}
                              {s.reason}
                            </li>))}
                        </ul>
                      </div>)}
                  </div>))}

                {selected.profileSnapshot && (<div className="bg-gray-50 border-t border-gray-200 rounded-lg p-4 text-gray-700 shadow-inner space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Trader Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-base">
                      {Object.entries(selected.profileSnapshot).map(([key, value]) => (<div key={key} className="flex flex-col">
                            <p className="text-sm text-gray-500 font-medium capitalize">
                              {key}
                            </p>
                            <p className="text-gray-900">
                              {Array.isArray(value)
                        ? value.join(", ")
                        : typeof value === "string"
                            ? value
                            : JSON.stringify(value)}
                            </p>
                          </div>))}
                    </div>
                  </div>)}
              </>)}
          </react_2.Dialog.Panel>
        </div>
      </react_2.Dialog>
    </main>);
}
