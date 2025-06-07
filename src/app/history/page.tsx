import { Suspense } from "react";
import HistoryPage from "./historypage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryPage />
    </Suspense>
  );
}
