"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
const google_1 = require("next/font/google");
const sidebarlayout_1 = __importDefault(require("./sidebarlayout"));
const inter = (0, google_1.Inter)({ subsets: ["latin"] });
exports.metadata = {
    title: "TradingCoach",
    description: "Your AI-based trading mentor",
};
function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <sidebarlayout_1.default>{children}</sidebarlayout_1.default>
      </body>
    </html>);
}
