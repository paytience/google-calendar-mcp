"use client";

import { useState } from "react";

const configs = [
  {
    name: "Claude Code",
    file: "~/.claude/settings.json",
    npx: `{
  "mcpServers": {
    "outlook": {
      "command": "npx",
      "args": ["-y", "outlook-mcp"],
      "env": {
        "OUTLOOK_MCP_API_KEY": "<your-api-key>"
      }
    }
  }
}`,
    docker: `{
  "mcpServers": {
    "outlook": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "OUTLOOK_MCP_API_KEY=<your-api-key>", "ghcr.io/paytience/outlook-mcp:latest"],
    }
  }
}`,
  },
  {
    name: "Cursor",
    file: ".cursor/mcp.json",
    npx: `{
  "mcpServers": {
    "outlook": {
      "command": "npx",
      "args": ["-y", "outlook-mcp"],
      "env": {
        "OUTLOOK_MCP_API_KEY": "<your-api-key>"
      }
    }
  }
}`,
    docker: `{
  "mcpServers": {
    "outlook": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "OUTLOOK_MCP_API_KEY=<your-api-key>", "ghcr.io/paytience/outlook-mcp:latest"],
    }
  }
}`,
  },
  {
    name: "Windsurf",
    file: "~/.codeium/windsurf/mcp_config.json",
    npx: `{
  "mcpServers": {
    "outlook": {
      "command": "npx",
      "args": ["-y", "outlook-mcp"],
      "env": {
        "OUTLOOK_MCP_API_KEY": "<your-api-key>"
      }
    }
  }
}`,
    docker: `{
  "mcpServers": {
    "outlook": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "OUTLOOK_MCP_API_KEY=<your-api-key>", "ghcr.io/paytience/outlook-mcp:latest"],
    }
  }
}`,
  },
  {
    name: "Docker",
    file: "docker run",
    code: `docker run -e OUTLOOK_MCP_API_KEY=<your-api-key> ghcr.io/paytience/outlook-mcp:latest`,
  },
];

export function ConfigSnippets() {
  const [active, setActive] = useState(0);
  const [method, setMethod] = useState<"npx" | "docker">("npx");

  const code = configs[active][method];

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
  );
}
