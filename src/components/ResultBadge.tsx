import { FINAL_RESULT_LABEL, type FinalResult } from "@/lib/types";

const STYLE: Record<FinalResult, string> = {
  claimant_win: "bg-emerald-100 text-emerald-800 border-emerald-300",
  partial: "bg-amber-100 text-amber-800 border-amber-300",
  claimant_lose: "bg-gray-100 text-gray-700 border-gray-300",
  dismissed: "bg-rose-100 text-rose-800 border-rose-300",
};

export default function ResultBadge({ result }: { result: FinalResult }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-1 rounded border ${STYLE[result]}`}
      data-testid={`result-badge-${result}`}
    >
      {FINAL_RESULT_LABEL[result]}
    </span>
  );
}
