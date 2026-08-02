import { buildWorkbookBuffer } from "@/lib/excel-generator"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const buffer = await buildWorkbookBuffer()
  const fileName = "Gestion-Boutique-Telecom.xlsx"

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "no-store",
    },
  })
}
