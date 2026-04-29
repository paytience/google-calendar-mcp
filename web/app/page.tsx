export default function Home() {
  return (
    <main style={{ maxWidth: 600, margin: "80px auto", padding: "0 20px", fontFamily: "system-ui" }}>
      <h1>Outlook MCP</h1>
      <p>Connect your Microsoft Outlook account to AI assistants via the Model Context Protocol.</p>
      <p style={{ color: "#666" }}>
        This page is used by the <code>outlook-mcp</code> npm package to authenticate your Outlook account.
        If you arrived here directly, install the package first:
      </p>
      <pre style={{ background: "#f4f4f4", padding: 16, borderRadius: 8 }}>npx outlook-mcp</pre>
    </main>
  );
}
