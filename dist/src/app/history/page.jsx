"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Page;
const react_1 = require("react");
const historypage_1 = __importDefault(require("./historypage"));
function Page() {
    return (<react_1.Suspense fallback={<div>Loading...</div>}>
      <historypage_1.default />
    </react_1.Suspense>);
}
