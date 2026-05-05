"use client";

import { useState } from "react";

const configs = [
  {
    name: "Claude Code",
    file: "~/.claude.json",
    npx: `{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@paytience/google-calendar-mcp@latest"],
      "env": {
        "GOOGLE_CALENDAR_MCP_API_KEY": "<your-api-key>"
      }
    }
  }
}`,
    docker: `{
  "mcpServers": {
    "google-calendar": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GOOGLE_CALENDAR_MCP_API_KEY", "ghcr.io/paytience/google-calendar-mcp:latest"],
      "env": {
        "GOOGLE_CALENDAR_MCP_API_KEY": "<your-api-key>"
      }
    }
  }
}`,
  },
  {
    name: "Cursor",
    file: ".cursor/mcp.json",
    npx: `{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@paytience/google-calendar-mcp@latest"],
      "env": {
        "GOOGLE_CALENDAR_MCP_API_KEY": "<your-api-key>"
      }
    }
  }
}`,
    docker: `{
  "mcpServers": {
    "google-calendar": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GOOGLE_CALENDAR_MCP_API_KEY", "ghcr.io/paytience/google-calendar-mcp:latest"],
      "env": {
        "GOOGLE_CALENDAR_MCP_API_KEY": "<your-api-key>"
      }
    }
  }
}`,
  },
  {
    name: "Windsurf",
    file: "~/.codeium/windsurf/mcp_config.json",
    npx: `{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@paytience/google-calendar-mcp@latest"],
      "env": {
        "GOOGLE_CALENDAR_MCP_API_KEY": "<your-api-key>"
      }
    }
  }
}`,
    docker: `{
  "mcpServers": {
    "google-calendar": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GOOGLE_CALENDAR_MCP_API_KEY", "ghcr.io/paytience/google-calendar-mcp:latest"],
      "env": {
        "GOOGLE_CALENDAR_MCP_API_KEY": "<your-api-key>"
      }
    }
  }
}`,
  },
  {
    name: "Kiro",
    file: ".kiro/settings/mcp.json",
    npx: `{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@paytience/google-calendar-mcp@latest"],
      "env": {
        "GOOGLE_CALENDAR_MCP_API_KEY": "<your-api-key>"
      }
    }
  }
}`,
    docker: `{
  "mcpServers": {
    "google-calendar": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GOOGLE_CALENDAR_MCP_API_KEY", "ghcr.io/paytience/google-calendar-mcp:latest"],
      "env": {
        "GOOGLE_CALENDAR_MCP_API_KEY": "<your-api-key>"
      }
    }
  }
}`,
  },
];

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function ConfigSnippets() {
  const [active, setActive] = useState(0);
  const [method, setMethod] = useState<"npx" | "docker">("npx");
  const [copied, setCopied] = useState(false);

  const code = configs[active][method];

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden text-left">
      <div className="flex border-b border-zinc-800 items-center">
        <div className="flex flex-1">
          {configs.map((config, i) => (
            <button
              key={config.name}
              onClick={() => setActive(i)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                active === i
                  ? "text-white bg-zinc-800/50 border-b-2 border-blue-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>
        <div className="flex mr-3 rounded-md bg-zinc-800 p-0.5">
          <button
            onClick={() => setMethod("npx")}
            className={`px-2.5 py-1 text-[10px] font-medium rounded transition-colors ${
              method === "npx"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            npx
          </button>
          <button
            onClick={() => setMethod("docker")}
            className={`px-2.5 py-1 text-[10px] font-medium rounded transition-colors ${
              method === "docker"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Docker
          </button>
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs text-zinc-500 mb-3">
          Add to <code className="text-zinc-400">{configs[active].file}</code>:
        </p>
        <div className="relative group">
          <button
            onClick={copyCode}
            className="absolute top-3 right-3 p-1.5 rounded-md bg-zinc-800 border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-700"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <CopyIcon className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>
          <pre className="text-xs font-mono bg-zinc-950 rounded-lg p-4 overflow-x-auto border border-zinc-800">
            {code.split("\n").map((line, i) => {
              if (line.includes("<your-api-key>")) {
                const [before, after] = line.split("<your-api-key>");
                return (
                  <div key={i} className="text-zinc-300">
                    {before}
                    <span className="text-emerald-400 border border-emerald-400/30 bg-emerald-400/5 rounded px-1 py-0.5">
                      {"<your-api-key>"}
                    </span>
                    {after}
                  </div>
                );
              }
              return (
                <div key={i} className="text-zinc-300">
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
}
