# @pipeworx/ror

[Research Organization Registry (ROR)](https://ror.org) MCP — canonical identifiers for research organizations. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search(query, type?, country?, page?)` — search organizations
- `get(ror_id)` — full org record by ROR id (e.g. `https://ror.org/03vek6s52`)
- `affiliation(text)` — fuzzy affiliation-string match (returns candidates with scores)

## Data source

`https://api.ror.org/v2/organizations`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "ror": {
      "url": "https://gateway.pipeworx.io/ror/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Ror data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
