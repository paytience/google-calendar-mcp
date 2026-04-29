"use client";

import { useState } from "react";

const configs = [
  {
    name: "Claude Code",
    file: "~/.claude/settings.json",
    code: `{
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
  },
  {
    name: "Cursor",
    file: ".cursor/mcp.json",
    code: `{
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
  },
  {
    name: "Windsurf",
    file: "~/.codeium/windsurf/mcp_config.json",
    code: `{
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
  },
];

export function ConfigSnippets() {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden text-left">
      <div className="flex border-b border-zinc-800">
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
      <div className="p-5">
        <p className="text-xs text-zinc-500 mb-3">
          Add to <code className="text-zinc-400">{configs[active].file}</code>:
        </p>
        <pre className="text-xs font-mono bg-zinc-950 rounded-lg p-4 overflow-x-auto border border-zinc-800">
          {configs[active].code.split("\n").map((line, i) => (
            <div
              key={i}
              className={
                line.includes("OUTLOOK_MCP_API_KEY")
                  ? "text-amber-400 bg-amber-400/10 -mx-4 px-4 py-0.5 rounded"
                  : "text-zinc-300"
              }
            >
              {line}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
