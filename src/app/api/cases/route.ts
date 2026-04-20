// GET /api/cases - 検索・絞り込み対応
// クエリパラメータ:
//   subcategory : income_tax / corporate_tax / inheritance_tax / consumption_tax / local_tax / other
//   q          : キーワード（空白区切りで AND 検索）
//   limit      : 上限件数

import { NextResponse } from "next/server";
import { getAllCases, searchCases } from "@/lib/cases";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subcategory = searchParams.get("subcategory");
  const q = searchParams.get("q");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

  const total = getAllCases().length;
  const filtered = searchCases({ subcategory, q });
  const cases =
    limit && Number.isFinite(limit) && limit > 0
      ? filtered.slice(0, limit)
      : filtered;

  return NextResponse.json({
    total,
    matched: filtered.length,
    count: cases.length,
    query: { subcategory, q, limit },
    cases,
  });
}
