'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDocStore, InputType, DocType, ToneType } from '@/lib/store';
import { validateInput } from '@/lib/validators';
import { Play, Trash2, BookOpen, Sparkles, Code2 } from 'lucide-react';
import { toast } from 'sonner';

// Dynamically import Monaco Editor to bypass SSR "window is not defined" issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] bg-slate-900 flex flex-col items-center justify-center text-slate-400 rounded-lg border border-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-xs font-mono">Loading rich editor...</p>
      </div>
    ),
  }
);

// High-quality sample templates for testing
const SAMPLE_TEMPLATES: Record<InputType, { title: string; language: string; content: string }> = {
  code: {
    title: 'JavaScript getUserProfile API',
    language: 'javascript',
    content: `/**
 * Fetches the complete profile of a user, validates permissions,
 * and caches results for subsequent calls.
 * 
 * @async
 * @param {string} userId - The unique identifier of the user.
 * @param {string} requestToken - OAuth token for authentication validation.
 * @returns {Promise<UserProfile>} Resolve with user account profile data.
 * @throws {NotFoundError} If the user does not exist in db.
 * @throws {UnauthorizedError} If the request token is invalid.
 */
async function getUserProfile(userId, requestToken) {
  if (!requestToken) {
    throw new UnauthorizedError('Access denied: Authentication token required.');
  }

  // Validate session against identity manager
  const session = await authProvider.verifySession(requestToken);
  if (!session || session.userId !== userId) {
    throw new UnauthorizedError('Access denied: Token mismatch.');
  }

  // Check cache first
  const cacheKey = \`user:profile:\${userId}\`;
  const cachedProfile = await redisCache.get(cacheKey);
  if (cachedProfile) {
    return JSON.parse(cachedProfile);
  }

  // Database read
  const user = await db.users.findUnique({
    where: { id: userId },
    include: { preferences: true, billing: true }
  });

  if (!user) {
    throw new NotFoundError(\`User with ID \${userId} was not found.\`);
  }

  // Sanitize password/credentials before returning
  const sanitizedProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    joinedAt: user.createdAt,
    tier: user.billing.subscriptionTier,
    preferences: user.preferences
  };

  // Cache response for 5 minutes
  await redisCache.set(cacheKey, JSON.stringify(sanitizedProfile), 'EX', 300);

  return sanitizedProfile;
}`,
  },
  swagger: {
    title: 'OpenAPI 3.0 UserService JSON',
    language: 'json',
    content: `{
  "openapi": "3.0.0",
  "info": {
    "title": "User Manager API Service",
    "version": "1.4.0",
    "description": "Enterprise microservice API for searching, updating, and deleting account records."
  },
  "servers": [
    {
      "url": "https://api.user-service.net/v1",
      "description": "Production Server"
    }
  ],
  "paths": {
    "/users": {
      "get": {
        "summary": "Query profiles with filter parameters",
        "parameters": [
          {
            "name": "role",
            "in": "query",
            "required": false,
            "schema": {
              "type": "string",
              "enum": ["admin", "developer", "customer"]
            },
            "description": "Filter accounts by system access role"
          },
          {
            "name": "limit",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "default": 20
            },
            "description": "Maximum records to return (max 100)"
          }
        ],
        "responses": {
          "200": {
            "description": "Matching accounts array returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/UserProfile"
                  }
                }
              }
            }
          },
          "429": {
            "description": "Rate limits exceeded"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "UserProfile": {
        "type": "object",
        "required": ["id", "email", "status"],
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "example": "a8f309a0-62e9-4e78-9e53-cfbb6b3d11b3"
          },
          "email": {
            "type": "string",
            "format": "email",
            "example": "dev@mycompany.com"
          },
          "status": {
            "type": "string",
            "enum": ["active", "suspended", "pending"],
            "example": "active"
          }
        }
      }
    }
  }
}`,
  },
  signature: {
    title: 'Go struct and Interface signature',
    language: 'go',
    content: `package payments

import "context"

// PaymentStatus indicates the current transaction lifecycle phase
type PaymentStatus string

const (
	StatusPending   PaymentStatus = "PENDING"
	StatusSucceeded PaymentStatus = "SUCCEEDED"
	StatusFailed    PaymentStatus = "FAILED"
)

// Transaction holds invoice details and processor status
type Transaction struct {
	TxID          string        \`json:"tx_id"\`
	CustomerID    string        \`json:"customer_id"\`
	AmountCents   int64         \`json:"amount_cents"\`
	Currency      string        \`json:"currency"\`
	Status        PaymentStatus \`json:"status"\`
	FailureReason string        \`json:"failure_reason,omitempty"\`
}

// PaymentProcessor coordinates client integrations and merchant accounts
type PaymentProcessor interface {
	// ChargeCard creates a direct capture transaction with external vendors (Stripe, Adyen)
	ChargeCard(ctx context.Context, custID string, amount int64, currency string) (*Transaction, error)
	
	// IssueRefund reverses a completed transaction by ID, returning status details
	IssueRefund(ctx context.Context, txID string, amount int64) (*Transaction, error)
	
	// SyncWebhookStatus validates webhooks, updates database entries, and streams event pipelines
	SyncWebhookStatus(ctx context.Context, payload []byte, signature string) error
}`,
  },
  readme: {
    title: 'README setup notes template',
    language: 'markdown',
    content: `# Analytics Microservice

High-performance real-time analytics aggregation engine running Node.js 20 + Kafka + ClickHouse.

## Local Configuration Checklist
You must specify the following values in your \`.env\` file in the root directory:
\`\`\`bash
PORT=8080
KAFKA_BROKERS=localhost:9092
CLICKHOUSE_URL=http://localhost:8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASS=super_secure_pass
REDIS_URL=redis://localhost:6379
\`\`\`

## Quick Installation & Launch
1. Ensure Docker Desktop is active
2. Clone repository and install local dependencies:
   \`\`\`bash
   git clone git@github.com:analytics/aggregator.git
   cd aggregator
   npm install
   \`\`\`
3. Spin up dependency containers using Docker Compose:
   \`\`\`bash
   docker-compose up -d
   \`\`\`
4. Apply ClickHouse database schema migrations:
   \`\`\`bash
   npm run db:migrate
   \`\`\`
5. Start development hot-reload server:
   \`\`\`bash
   npm run dev
   \`\`\`
`,
  },
  architecture: {
    title: '3-tier Web App Blueprint',
    language: 'markdown',
    content: `Title: Multi-Region Video Streaming Architecture

System Design & Blueprint Context:
We are documenting a global, high-scale video-on-demand platform serving 5M+ active daily users.

Technical Details:
- Frontend Client: Next.js SPA hosted on Cloudflare Pages, utilizing regional edge workers for geo-routing and localized landing experiences.
- API Layer: Golang RESTful API Gateway serving as a centralized routing interface, handling token JWT authentication, strict rate limiting (via Redis token buckets), and logging.
- Database Layer: 
  - Primary transactional state stored in PostgreSQL (multi-region with single write master and read replicas in 3 zones).
  - Quick catalog search powered by an Elasticsearch cluster.
  - Video content stored inside Amazon S3, indexed with unique SHA-256 tokens.
- CDN & Transcoding Pipeline:
  - Global AWS CloudFront CDN caching chunked HLS content at 200+ edge locations.
  - AWS Elemental MediaConvert microservice triggers auto-transcoding of newly uploaded files (to 4k, 1080p, 720p HLS profiles) whenever write events post to S3.
- Ingestion Events: Apache Kafka cluster streams analytics (buffer rates, click streams, error reports) directly into ClickHouse database instances for monitoring dashboards.`,
  },
};

export default function InputSection() {
  const {
    input,
    inputType,
    documentationType,
    tone,
    setInput,
    setInputType,
    setDocumentationType,
    setTone,
    setDocumentation,
    setLoading,
    setError,
    clear,
    isLoading,
  } = useDocStore();

  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [editorLang, setEditorLang] = useState('javascript');
  const [charCount, setCharCount] = useState(0);

  // Sync Monaco editor language highlights to inputType
  useEffect(() => {
    switch (inputType) {
      case 'code':
        setEditorLang('javascript');
        break;
      case 'swagger':
        setEditorLang(input.trim().startsWith('{') ? 'json' : 'yaml');
        break;
      case 'signature':
        setEditorLang('typescript');
        break;
      case 'readme':
      case 'architecture':
        setEditorLang('markdown');
        break;
      default:
        setEditorLang('javascript');
    }
  }, [inputType, input]);

  // Keep character count accurate
  useEffect(() => {
    setCharCount(input.length);
  }, [input]);

  const handleInputChange = (val: string | undefined) => {
    setInput(val || '');
  };

  const getPlaceholderText = (): string => {
    switch (inputType) {
      case 'code':
        return 'Paste your code here (JavaScript, Python, Go, Java, TypeScript, etc.)...';
      case 'swagger':
        return 'Paste your OpenAPI or Swagger API specification here (YAML or JSON format)...';
      case 'signature':
        return 'Paste your function/class signature with docstrings, comments, or headers...';
      case 'readme':
        return 'Paste your existing README or markdown notes that you want to clean up, improve, or structure...';
      case 'architecture':
        return 'Describe your architecture, database layout, components, tech stack, and design pattern blueprints...';
      default:
        return 'Paste content to get started...';
    }
  };

  const loadSample = (type: InputType) => {
    const sample = SAMPLE_TEMPLATES[type];
    setInput(sample.content);
    setInputType(type);
    setIsSampleOpen(false);
    toast.success(`Loaded sample: ${sample.title}`);
  };

  const handleGenerate = async () => {
    // 1. Client-side Validation check
    const validationResult = validateInput(input, inputType);
    if (!validationResult.valid) {
      setError(validationResult.message || 'Validation failed.');
      toast.error(validationResult.message || 'Input validation failed.');
      return;
    }

    setLoading(true);
    setError(null);
    setDocumentation('');

    try {
      // Load custom API key from localStorage if it exists
      const customKey = localStorage.getItem('CUSTOM_GEMINI_API_KEY') || '';
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customKey ? { 'x-gemini-key': customKey } : {}),
        },
        body: JSON.stringify({
          input,
          inputType,
          documentationType,
          tone,
          language: 'auto',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server returned an error response.');
      }

      if (!response.body) {
        throw new Error('Response stream is empty.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedDoc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(line.trim().slice(6));
              
              if (data.status === 'generating' && data.content) {
                streamedDoc += data.content;
                setDocumentation(streamedDoc);
              } else if (data.status === 'error') {
                throw new Error(data.message || 'Error occurred during streaming.');
              }
            } catch {
              // Ignore partial chunk syntax errors or line anomalies
            }
          }
        }
      }

      setLoading(false);
      toast.success('Technical documentation generated successfully!');
    } catch (err) {
      console.error('Generation execution error:', err);
      const errMsg = (err as Error).message || 'A network error occurred. Please try again.';
      setError(errMsg);
      setLoading(false);
      toast.error(`❌ Failed to generate: ${errMsg}`);
    }
  };

  return (
    <div className="flex flex-col gap-5 bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
      {/* 1. Input Format Type Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-900 mb-2.5 uppercase tracking-wider">
          1. Select Input Format
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {(['code', 'swagger', 'signature', 'readme', 'architecture'] as InputType[]).map((type) => (
            <label
              key={type}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center cursor-pointer transition-all ${
                inputType === type
                  ? 'border-blue-500 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="inputType"
                checked={inputType === type}
                onChange={() => setInputType(type)}
                className="sr-only"
              />
              <span className="text-[11px] font-bold capitalize mt-0.5">
                {type === 'swagger' ? 'OpenAPI Spec' : type === 'signature' ? 'Function Sig' : type === 'code' ? 'Raw Code' : type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Monaco Editor Container */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1 uppercase tracking-wider">
          <span>2. Enter Source Metadata</span>
          <span className={charCount > 10000 ? 'text-red-500 font-bold' : 'text-slate-400'}>
            {charCount.toLocaleString()} / 10,000 chars
          </span>
        </div>

        {/* Editor Shell */}
        <div className="relative border border-slate-200 rounded-lg overflow-hidden group">
          <MonacoEditor
            height="360px"
            language={editorLang}
            value={input}
            onChange={handleInputChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              readOnly: isLoading,
              theme: 'vs-light',
              domReadOnly: false,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
              automaticLayout: true,
              placeholder: getPlaceholderText(),
            }}
          />
        </div>
      </div>

      {/* 3. Output Document Type Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
            3. Target Document Type
          </label>
          <select
            value={documentationType}
            onChange={(e) => setDocumentationType(e.target.value as DocType)}
            disabled={isLoading}
            className="w-full text-sm text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold"
          >
            <option value="api-reference">API Reference Endpoint Docs</option>
            <option value="function-docs">Detailed Function API Docs</option>
            <option value="setup-guide">System Setup & Install Guide</option>
            <option value="architecture">Architecture Design Blueprint</option>
            <option value="integration">Integration & SDK SDK Usage</option>
            <option value="troubleshooting">Troubleshooting & Error Matrix</option>
            <option value="schema">Database Schema Models Docs</option>
          </select>
        </div>

        {/* 4. Tone Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
            4. Writing Tone
          </label>
          <div className="grid grid-cols-3 gap-2 h-[42px]">
            {(['technical', 'beginner', 'executive'] as ToneType[]).map((t) => (
              <label
                key={t}
                title={
                  t === 'technical'
                    ? 'Formal, precise developer descriptions'
                    : t === 'beginner'
                    ? 'Simple language with full tutorial context'
                    : 'PM/Stakeholder high-level blueprints'
                }
                className={`flex items-center justify-center rounded-lg border text-center cursor-pointer font-bold text-[11px] capitalize transition-all select-none ${
                  tone === t
                    ? 'border-blue-500 bg-blue-50/50 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="tone"
                  checked={tone === t}
                  onChange={() => setTone(t)}
                  className="sr-only"
                />
                {t === 'beginner' ? 'Beginner-Friendly' : t === 'executive' ? 'Executive' : t}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Main Control Action Buttons */}
      <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-1">
        {/* Left Side sample controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSampleOpen(true)}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-slate-700 hover:text-blue-600 rounded-lg text-xs font-semibold hover:bg-slate-50 border border-slate-200 transition-all"
          >
            <BookOpen size={14} />
            <span>Sample Templates</span>
          </button>

          <button
            type="button"
            onClick={clear}
            disabled={isLoading || !input}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold disabled:opacity-50 transition-all"
            title="Reset code entry"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>

        {/* Right primary generate */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2.5 font-bold text-sm shadow-md shadow-blue-500/10 transition-all select-none hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-75 disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles size={15} className="animate-pulse" />
              <span>Generate Documentation</span>
            </>
          )}
        </button>
      </div>

      {/* Sample Code drawer template modal */}
      {isSampleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden scale-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <Code2 className="text-blue-600" size={18} />
                <h3 className="text-sm font-bold text-slate-900">Select Test Snippet</h3>
              </div>
              <button
                onClick={() => setIsSampleOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg"
              >
                <Trash2 size={16} className="rotate-45" />
              </button>
            </div>

            <div className="p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
              {(Object.keys(SAMPLE_TEMPLATES) as InputType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => loadSample(type)}
                  className="w-full text-left p-3.5 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 rounded-lg transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 capitalize">
                      {type === 'swagger' ? 'OpenAPI JSON Specs' : type === 'signature' ? 'Go Interfaces / Signatures' : `${type} Template`}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                      {SAMPLE_TEMPLATES[type].title}
                    </p>
                  </div>
                  <Play size={12} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsSampleOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
