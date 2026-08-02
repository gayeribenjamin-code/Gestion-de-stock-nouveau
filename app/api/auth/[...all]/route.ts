import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

const handlers = toNextJsHandler(auth.handler)

export async function POST(req: Request) {
  console.log("[v0] auth POST origin=", req.headers.get("origin"), "host=", req.headers.get("host"), "referer=", req.headers.get("referer"))
  return handlers.POST(req)
}

export const GET = handlers.GET
