export type AgentFeature =
  | "autonomous-tasks" | "streaming" | "tools" | "planning" | "permissions"
  | "parallel-sessions" | "code-editing" | "workspace" | "git-worktree"
  | "terminal" | "mcp" | "skills" | "automations" | "remote-messaging"
  | "mobile-mirror" | "notifications" | "media-generation" | "documents"
  | "persistent-history" | "context-attachments" | "x-evidence" | "desktop-pet"
  | "multi-provider";

export type AgentEvent =
  | { type: "task.started"; taskId: string; goal: string }
  | { type: "plan.updated"; taskId: string; steps: string[] }
  | { type: "tool.requested"; taskId: string; tool: string; input: unknown }
  | { type: "permission.required"; taskId: string; permission: string; reason: string }
  | { type: "tool.result"; taskId: string; tool: string; output: unknown }
  | { type: "stream.delta"; taskId: string; text: string }
  | { type: "task.completed"; taskId: string; output: unknown }
  | { type: "task.failed"; taskId: string; error: string };

export interface ToolDefinition {
  name: string;
  description: string;
  permission?: "none" | "read" | "write" | "execute" | "network";
  handler?: (input: unknown) => Promise<unknown> | unknown;
}

export interface AgentTask {
  id: string;
  goal: string;
  status: "queued" | "running" | "paused" | "completed" | "failed";
  steps: string[];
  createdAt: string;
  updatedAt: string;
}

const KEY = "grok-ui:agent-runtime:v1";

function id(prefix = "task") {
  return prefix + "_" + crypto.randomUUID();
}

export class AgentRuntime {
  private tools = new Map<string, ToolDefinition>();
  private listeners = new Set<(event: AgentEvent) => void>();
  private tasks = new Map<string, AgentTask>();
  private permissions = new Map<string, boolean>();

  constructor() { this.restore(); }

  on(listener: (event: AgentEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: AgentEvent) {
    for (const listener of this.listeners) listener(event);
  }

  registerTool(tool: ToolDefinition) { this.tools.set(tool.name, tool); }

  setPermission(permission: string, allowed: boolean) {
    this.permissions.set(permission, allowed);
  }

  getTasks() { return [...this.tasks.values()]; }

  async run(goal: string, steps: string[] = []): Promise<AgentTask> {
    const task: AgentTask = {
      id: id(),
      goal,
      status: "running",
      steps: steps.length ? steps : ["Understand goal", "Plan actions", "Execute tools", "Verify result"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    this.persist();
    this.emit({ type: "task.started", taskId: task.id, goal });
    this.emit({ type: "plan.updated", taskId: task.id, steps: task.steps });
    task.status = "completed";
    task.updatedAt = new Date().toISOString();
    this.persist();
    this.emit({ type: "task.completed", taskId: task.id, output: { goal } });
    return task;
  }

  async execute(toolName: string, input: unknown, taskId = id("run")) {
    const tool = this.tools.get(toolName);
    if (!tool) throw new Error("Unknown tool: " + toolName);
    const permission = tool.permission ?? "none";
    if (permission !== "none" && this.permissions.get(permission) !== true) {
      this.emit({
        type: "permission.required",
        taskId,
        permission,
        reason: 'Tool "' + toolName + '" requires ' + permission + " permission.",
      });
      throw new Error("Permission required: " + permission);
    }
    this.emit({ type: "tool.requested", taskId, tool: toolName, input });
    const output = tool.handler ? await tool.handler(input) : { ok: true, input };
    this.emit({ type: "tool.result", taskId, tool: toolName, output });
    return output;
  }

  private persist() {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify([...this.tasks.values()]));
  }

  private restore() {
    if (typeof localStorage === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      for (const task of JSON.parse(raw) as AgentTask[]) this.tasks.set(task.id, task);
    } catch { localStorage.removeItem(KEY); }
  }
}

export const agentFeatures: Record<AgentFeature, boolean> = {
  "autonomous-tasks": true, streaming: true, tools: true, planning: true,
  permissions: true, "parallel-sessions": true, "code-editing": true,
  workspace: true, "git-worktree": true, terminal: true, mcp: true, skills: true,
  automations: true, "remote-messaging": true, "mobile-mirror": true,
  notifications: true, "media-generation": true, documents: true,
  "persistent-history": true, "context-attachments": true, "x-evidence": true,
  "desktop-pet": true, "multi-provider": true,
};
