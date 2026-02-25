/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/yahoo/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  }

  try {
    console.info("pageResp")
    // 1️⃣ Lấy cookie từ trang Yahoo Finance của symbol
    const pageResp = await fetch(`https://finance.yahoo.com/quote/${symbol}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });
    console.info("pageResp: ", pageResp)
    const cookies = pageResp.headers.get("set-cookie") || "";

    // 2️⃣ Lấy crumb từ query2 API
    const crumbResp = await fetch(
      "https://query2.finance.yahoo.com/v1/test/getcrumb",
      {
        headers: {
          Cookie: cookies,
          "User-Agent": "Mozilla/5.0",
        },
      }
    );
    const crumb = (await crumbResp.text()).trim();
    console.info("crumb: ", crumb)

    // 3️⃣ Fetch luôn PE từ quoteSummary
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,defaultKeyStatistics&crumb=${crumb}`;
    const res = await fetch(url, {
      headers: {
        Cookie: cookies,
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Yahoo API error: ${res.status}`);
    }

    const data = await res.json();

    console.info("data: ", data)

    const result = data?.quoteSummary?.result?.[0];

    const trailingPE = result?.summaryDetail?.trailingPE?.raw ?? null;
    const forwardPE = result?.defaultKeyStatistics?.forwardPE?.raw ?? null;

    return NextResponse.json({
      symbol,
      trailingPE,
      forwardPE,
    });
  } catch (err: any) {
    console.info("error: ", err)
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
