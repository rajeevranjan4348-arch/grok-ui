type HandlerEvent = { httpMethod?: string; body?: string | null };
type HandlerResponse = { statusCode: number; headers?: Record<string,string>; body: string };

const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
};

export default async function handler(event: HandlerEvent): Promise<HandlerResponse> {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "POST required" }) };
  }
  let input: { goal?: string; taskId?: string };
  try { input = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const goal = String(input.goal || "").trim();
  if (!goal) return { statusCode: 400, headers, body: JSON.stringify({ error: "goal is required" }) };

  const taskId = input.taskId || crypto.randomUUID();
  const events = [
    ["task.started", { taskId, goal }],
    ["plan.updated", { taskId, steps: ["Understand goal", "Plan", "Execute approved tools", "Verify"] }],
    ["stream.delta", { taskId, text: "Agent task accepted and ready for provider/tool execution." }],
    ["task.completed", { taskId, status: "ready" }],
  ];
  const body = events.map(([name, data]) => "event: " + name + "\ndata: " + JSON.stringify(data) + "\n\n").join("");
  return { statusCode: 200, headers: { ...headers, "content-type": "text/event-stream; charset=utf-8" }, body };
}
