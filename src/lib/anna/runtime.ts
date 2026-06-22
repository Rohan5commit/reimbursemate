/**
 * Anna Runtime Wrapper
 *
 * Connects to the Anna Host API when running inside an Anna-hosted iframe.
 * Provides a clean fallback for standalone development mode.
 *
 * The actual SDK is loaded at runtime from the Anna platform:
 *   import { AnnaAppRuntime } from "/static/anna-apps/_sdk/latest/index.js"
 *
 * In standalone mode, all Anna calls gracefully degrade to direct implementation.
 */
import type {
  AnnaRuntime,
  AnnaAppRuntimeStatic,
  LLMCompleteRequest,
  LLMCompleteResponse,
  ToolInvokeRequest,
  ToolInvokeResponse,
  ChatMessage,
  AgentSession,
  AgentSessionCreateRequest,
} from "./types";

// ── Singleton runtime instance ──────────────────────────────────────
let annaRuntime: AnnaRuntime | null = null;
let isAnnaHosted = false;

/**
 * Detect whether we're running inside the Anna platform iframe.
 * The Anna SDK injects a global `__ANNA_APP_RUNTIME__` marker.
 */
function detectAnnaHosted(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "__ANNA_APP_RUNTIME__" in window ||
    window.location.pathname.startsWith("/anna-app") ||
    window.location.hostname.includes("anna")
  );
}

/**
 * Connect to the Anna runtime. Returns the runtime object if running
 * inside Anna, or a proxy object that falls back to direct calls
 * when running standalone.
 */
export async function connectAnna(): Promise<AnnaRuntime> {
  if (annaRuntime) return annaRuntime;

  isAnnaHosted = detectAnnaHosted();

  if (isAnnaHosted) {
    try {
      // The Anna platform injects AnnaAppRuntime into the global scope
      // or exposes it via the Host API connection object.
      const globalRuntime = (
        window as unknown as Record<string, unknown>
      )["__ANNA_APP_RUNTIME__"] as AnnaAppRuntimeStatic | undefined;

      if (globalRuntime) {
        annaRuntime = await globalRuntime.connect();
        console.log("[Anna] Connected to Anna platform runtime");
        return annaRuntime;
      }

      // Fallback: try to find the runtime via the platform's injected bridge
      const platformBridge = (
        window as unknown as Record<string, unknown>
      )["anna"] as AnnaAppRuntimeStatic | undefined;

      if (platformBridge) {
        annaRuntime = await platformBridge.connect();
        console.log("[Anna] Connected via platform bridge");
        return annaRuntime;
      }
    } catch (err) {
      console.warn("[Anna] Failed to connect to platform runtime, falling back to standalone mode:", err);
      isAnnaHosted = false;
    }
  }

  // Standalone fallback — returns a proxy that routes calls through
  // our own implementation instead of the platform
  annaRuntime = createStandaloneRuntime();
  console.log("[Anna] Running in standalone mode (no platform host detected)");
  return annaRuntime;
}

/**
 * Whether we're connected to the real Anna platform.
 */
export function isRunningInAnna(): boolean {
  return isAnnaHosted;
}

// ── Standalone Fallback Runtime ─────────────────────────────────────
// Implements the same interface as Anna's Host API but routes calls
// through our own services (NVIDIA NIM, local storage, etc.).

function createStandaloneRuntime(): AnnaRuntime {
  return {
    llm: {
      async complete(req: LLMCompleteRequest): Promise<LLMCompleteResponse> {
        // In standalone mode, route through our NIM client
        const { extractReceipt } = await import("../ai/nim-client");
        // This is a simplified fallback — real extraction goes through tools.invoke
        const content = req.messages[req.messages.length - 1]?.content || "";
        const result = await extractReceipt(content);
        return {
          choices: [{ message: { content: JSON.stringify(result) } }],
        };
      },
    },

    tools: {
      async invoke(req: ToolInvokeRequest): Promise<ToolInvokeResponse> {
        // Route tool calls through our implementation
        switch (req.method) {
          case "extractReceipt": {
            const { extractReceipt } = await import("../ai/nim-client");
            const text = req.args.text as string;
            const result = await extractReceipt(text);
            return { result };
          }
          case "extractFromImage": {
            const { extractFromImage } = await import("../ai/nim-client");
            const dataUrl = req.args.imageDataUrl as string;
            const result = await extractFromImage(dataUrl);
            return { result };
          }
          default:
            return { result: null, error: `Unknown tool method: ${req.method}` };
        }
      },
    },

    chat: {
      async write_message(req: { content: string; role?: string }): Promise<void> {
        console.log(`[Anna:chat] ${req.role || "assistant"}: ${req.content}`);
      },
      async read_history(): Promise<ChatMessage[]> {
        return [];
      },
      async append_artifact(_content: string): Promise<void> {
        // No-op in standalone
      },
    },

    storage: {
      async get(key: string) {
        if (typeof window !== "undefined") {
          return { value: localStorage.getItem(`anna:${key}`) };
        }
        return { value: null };
      },
      async set(key: string, value: string) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`anna:${key}`, value);
        }
      },
      async delete(key: string) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(`anna:${key}`);
        }
      },
    },

    window: {
      async set_title(req) {
        if (typeof document !== "undefined") {
          document.title = req.title;
        }
      },
    },

    agent: {
      session: {
        async create(req: AgentSessionCreateRequest): Promise<AgentSession> {
          // In standalone mode, simulate HITL as auto-approved
          console.log(`[Anna:agent] HITL session requested: ${req.prompt}`);
          return {
            session_id: `standalone-${Date.now()}`,
            status: "approved",
            response: "Auto-approved in standalone mode",
          };
        },
        async list(): Promise<AgentSession[]> {
          return [];
        },
        async refresh(session_id: string): Promise<AgentSession> {
          return {
            session_id,
            status: "approved",
            response: "Auto-approved in standalone mode",
          };
        },
      },
    },
  };
}
