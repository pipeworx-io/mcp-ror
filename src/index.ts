interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * ROR MCP — Research Organization Registry.
 *
 * Auth: none. Docs: https://ror.readme.io/docs
 */


const BASE = 'https://api.ror.org/v2/organizations';
const UA = 'pipeworx-mcp-ror/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search organizations.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'e.g. "harvard university"' },
        type: { type: 'string', description: 'education | healthcare | company | archive | nonprofit | government | facility | other' },
        country: { type: 'string', description: 'ISO-3166 alpha-2 country code, e.g. "US"' },
        page: { type: 'number', description: '1-based page (default 1)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get',
    description: 'Full ROR record. Accepts the trailing identifier (e.g. "03vek6s52") or the full URL.',
    inputSchema: {
      type: 'object',
      properties: { ror_id: { type: 'string' } },
      required: ['ror_id'],
    },
  },
  {
    name: 'affiliation',
    description: 'Fuzzy affiliation-string match. Returns candidates with confidence scores.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search': {
      const params = new URLSearchParams({
        query: reqStr(args, 'query', '"harvard university"'),
        page: String(Math.max(1, (args.page as number) ?? 1)),
      });
      const filters: string[] = [];
      if (args.type) filters.push(`types:${args.type}`);
      if (args.country) filters.push(`country.country_code:${String(args.country).toUpperCase()}`);
      if (filters.length) params.set('filter', filters.join(','));
      return rorGet(`?${params}`);
    }
    case 'get': {
      const id = reqStr(args, 'ror_id', '"03vek6s52"').replace(/^https?:\/\/ror\.org\//, '');
      return rorGet(`/${encodeURIComponent(id)}`);
    }
    case 'affiliation': {
      const params = new URLSearchParams({ affiliation: reqStr(args, 'text', '"MIT"') });
      return rorGet(`?${params}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function rorGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (res.status === 404) throw new Error('ROR: not found');
  if (!res.ok) throw new Error(`ROR: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
