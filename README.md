# CleanData AI: Autonomous AI Data Specialist & Agent Knowledge Infrastructure

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Node_Native-003B57?style=flat&logo=sqlite)](https://nodejs.org/api/sqlite.html)

**CleanData AI** is an autonomous AI Data Specialist and Agent Knowledge Infrastructure platform. It independently ingests messy business data from any source (files, spreadsheets, clipboard, or continuous natural language prose), profiles and cleans it, extracts canonical entities and relationships, detects policy conflicts, stores it in typed relational tables, and vectorizes it for RAG systems and autonomous AI agents.

---

## 🌟 Core Architecture & The 10 Operating Modes

The system operates as an **Autonomous AI Data Specialist** that handles 95%+ of human data preparation work with minimal intervention:

1. 🧠 **Data Analyst**: Profiles distributions, missingness, column cardinality, semantic types, and anomalous records.
2. 🛠️ **Data Cleaner**: Standardizes phone numbers (E.164), emails, dates (ISO 8601), currencies, and tax IDs (EIN) while preserving corporate acronyms (`LLC`, `Inc.`, `Corp.`, `EIN`, `SLA`).
3. 📂 **Data Organizer**: Maps canonical entities, clusters aliases (e.g. *Apex Solutions* $\to$ *Apex Solutions LLC*), and constructs cross-source relationship graphs (`Person` $\to$ `EMPLOYED_BY` $\to$ `Company`).
4. 🏗️ **Knowledge Engineer**: Routes data into optimal storage tiers (Relational SQLite vs Semantic Vector Store vs Entity Registry).
5. 🛡️ **Data Guardian**: Enforces PII masking (SSN, credit cards, emails, phone numbers) and RBAC/ABAC role boundaries.
6. 📚 **Knowledge Librarian**: Manages document versioning, source authority ranking, and knowledge decay/freshness lifecycles.
7. 🔍 **Researcher & Conflict Detector**: Scans cross-source knowledge to detect contradictory policies (e.g. 30-day MSA refund vs 14-day Support Guide) with 1-click human exception resolution.
8. 🎯 **RAG Engineer**: Generates document-aware semantic chunks and automatically generates probe questions to self-test retrieval precision and latency.
9. 🤖 **Agent Knowledge Manager**: Packages clean, permission-gated context packets for autonomous AI agents via `POST /api/v1/agent/context` with active conflict warning injection.
10. ⚖️ **Data Validator**: Scores knowledge quality across 6 key dimensions to output the composite **AI READINESS SCORE (0–100)**.

---

## 🚀 Key Features

### 1. Intelligent Paragraph & Unstructured Ingestion
Paste continuous narrative paragraphs, meeting transcripts, emails, or notes. The AI automatically detects entity boundaries, company Tax IDs, contact emails, invoice codes, and currency amounts into clean tabular schemas.

### 2. Embedded SQLite Relational Hub
- Click **Save to SQL** to persist any active dataset directly into embedded SQLite (`data/cleandata.sqlite`).
- Dedicated typed tables (e.g. `tbl_companies`, `tbl_invoices`, `tbl_school_students`) created automatically.
- Built-in **Interactive SQL Explorer** to run joins, groupings, and exports directly in the browser.

### 3. Vectorization for RAG & Multi-Store Sync
- Automatically transforms records into natural language semantic passages with token estimations and metadata tags.
- Direct synchronization to **Pinecone**, **ChromaDB**, **Qdrant**, or **Supabase pgvector**.
- Instant export to line-delimited **JSONL** (LangChain / LlamaIndex / OpenAI) or raw **Supabase pgvector SQL**.

### 4. Production Agent Context Delivery API
Expose clean, authenticated context packets to autonomous agents:
```bash
POST /api/v1/agent/context
Content-Type: application/json

{
  "agentId": "support-agent-v1",
  "agentRole": "support_agent",
  "query": "Can I issue a refund for this invoice?",
  "customerId": "customer_apex_solutions"
}
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+ or 22+
- npm or yarn or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/rayyan1122pk-star/cleandata.git
cd cleandata

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page, or [http://localhost:3000/app](http://localhost:3000/app) for the Studio Workspace.

---

## 🧪 Automated Testing

All features are covered by automated verification suites:

```bash
# Test full AI Specialist engine & APIs
node scratch/test_ai_specialist_suite.mjs

# Test database, RAG vectorization, and agent context
node scratch/test_db_rag_vector.mjs

# Test all interactive buttons in real headless Chrome
node scratch/test_all_buttons_cdp.mjs
```

---

## 📄 License
MIT License. Free for commercial and private use.
