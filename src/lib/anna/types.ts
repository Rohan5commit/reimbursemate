/**
 * Anna Host API TypeScript types.
 *
 * These types describe the interface exposed by the Anna platform runtime
 * when an app runs inside an Anna-hosted iframe. The actual SDK is loaded
 * at runtime from `/static/anna-apps/_sdk/latest/index.js`.
 */

// ── LLM completion ──────────────────────────────────────────────────
export interface LLMCompleteRequest {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" | "text" };
}

export interface LLMCompleteResponse {
  choices: Array<{ message: { content: string } }>;
}

// ── Tool invocation ─────────────────────────────────────────────────
export interface ToolInvokeRequest {
  tool_id: string;
  method: string;
  args: Record<string, unknown>;
}

export interface ToolInvokeResponse {
  result: unknown;
  error?: string;
}

// ── Chat ────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface WriteMessageRequest {
  content: string;
  role?: "user" | "assistant";
}

// ── Storage ─────────────────────────────────────────────────────────
export interface StorageGetResponse {
  value: string | null;
}

// ── Window ──────────────────────────────────────────────────────────
export interface WindowSetTitleRequest {
  title: string;
}

// ── Agent Session (Human-in-the-Loop) ──────────────────────────────
export interface AgentSessionCreateRequest {
  prompt: string;
  on_behalf_of?: string;
}

export interface AgentSession {
  session_id: string;
  status: "pending" | "approved" | "rejected" | "completed";
  response?: string;
}

// ── Main Runtime Interface ──────────────────────────────────────────
export interface AnnaLLMNamespace {
  complete(req: LLMCompleteRequest): Promise<LLMCompleteResponse>;
}

export interface AnnaToolsNamespace {
  invoke(req: ToolInvokeRequest): Promise<ToolInvokeResponse>;
}

export interface AnnaChatNamespace {
  write_message(req: WriteMessageRequest): Promise<void>;
  read_history(): Promise<ChatMessage[]>;
  append_artifact(content: string): Promise<void>;
}

export interface AnnaStorageNamespace {
  get(key: string): Promise<StorageGetResponse>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface AnnaWindowNamespace {
  set_title(req: WindowSetTitleRequest): Promise<void>;
}

export interface AnnaAgentNamespace {
  session: {
    create(req: AgentSessionCreateRequest): Promise<AgentSession>;
    list(): Promise<AgentSession[]>;
    refresh(session_id: string): Promise<AgentSession>;
  };
}

/**
 * The full Anna runtime object returned by `AnnaAppRuntime.connect()`.
 * Each namespace is only available if declared in manifest.json.
 */
export interface AnnaRuntime {
  llm: AnnaLLMNamespace;
  tools: AnnaToolsNamespace;
  chat: AnnaChatNamespace;
  storage: AnnaStorageNamespace;
  window: AnnaWindowNamespace;
  agent: AnnaAgentNamespace;
}

// ── Runtime Connection ──────────────────────────────────────────────
export interface AnnaAppRuntimeStatic {
  connect(): Promise<AnnaRuntime>;
}
