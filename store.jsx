import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const seed = () => ({
  organisation: {
    name: 'Northwind Global Plc',
    industry: 'Wholesale Distribution',
    countries: 'UK, USA, Germany, Singapore',
    size: '12,000 employees',
    businessModel: 'B2B distribution and managed services',
    budget: '£24M over 3 years',
    timeline: '36 months',
    priorities: 'Cut cost to serve, protect margins, and embed AI governance from day one.',
    aiAmbition: 'Become an AI-augmented operator where controlled agents work on trusted enterprise data.'
  },
  departments: [
    { id: 'dep1', name: 'Sales & Marketing', owner: 'Aisha Blackwell', maturity: 64 },
    { id: 'dep2', name: 'Finance & Operations', owner: 'Marcus Chen', maturity: 72 },
    { id: 'dep3', name: 'Supply Chain', owner: 'Priya Nair', maturity: 58 },
    { id: 'dep4', name: 'Product & R&D', owner: 'Tomás Rivera', maturity: 81 },
    { id: 'dep5', name: 'Customer Success', owner: 'Fatima Zaman', maturity: 47 }
  ],
  objectives: [
    { id: 'obj1', name: 'Compress order-to-cash cycle', departmentId: 'dep2', kpi: 'Cycle time', target: '↓ 35%', value: 2500000 },
    { id: 'obj2', name: 'Rescue at-risk accounts before churn', departmentId: 'dep1', kpi: 'Churn rate', target: '↓ 22%', value: 3400000 },
    { id: 'obj3', name: 'Cut demand forecast error in half', departmentId: 'dep3', kpi: 'Forecast accuracy', target: '↑ 48pp', value: 1900000 },
    { id: 'obj4', name: 'Automate regulatory reporting pack', departmentId: 'dep2', kpi: 'Report cycle', target: '4 hrs → 1 hr', value: 1200000 },
    { id: 'obj5', name: 'Accelerate clinical documentation review', departmentId: 'dep4', kpi: 'Review throughput', target: '3.1×', value: 2900000 },
    { id: 'obj6', name: 'Simulate new-product launch scenarios', departmentId: 'dep4', kpi: 'Scenario coverage', target: '5×', value: 1100000 },
    { id: 'obj7', name: 'Autonomous incident triage and remediation', departmentId: 'dep2', kpi: 'MTTR', target: '↓ 60%', value: 2200000 }
  ],
  domains: [
    { id: 'dom1', name: 'Customer', departmentId: 'dep1', businessOwner: 'CMO', dataOwner: 'Aisha Blackwell', steward: 'Michael Osei', systems: ['Salesforce', 'Billing', 'Support Desk'], trust: 92, quality: 95, risk: 'Low' },
    { id: 'dom2', name: 'Product & Catalogue', departmentId: 'dep4', businessOwner: 'CPO', dataOwner: '', steward: 'Lena Fischer', systems: ['PLM', 'ERP'], trust: 76, quality: 81, risk: 'Medium' },
    { id: 'dom3', name: 'Order & Fulfilment', departmentId: 'dep2', businessOwner: 'COO', dataOwner: 'Marcus Chen', steward: 'David Kim', systems: ['ERP', 'Warehouse', 'Carrier feeds'], trust: 84, quality: 88, risk: 'Low' },
    { id: 'dom4', name: 'Inventory', departmentId: 'dep3', businessOwner: 'COO', dataOwner: '', steward: 'Sofia Rossi', systems: ['ERP', 'IoT telemetry', 'Data lake'], trust: 61, quality: 66, risk: 'High' },
    { id: 'dom5', name: 'Finance & Regulatory', departmentId: 'dep2', businessOwner: 'CFO', dataOwner: 'Priya Nair', steward: 'James Carter', systems: ['General Ledger', 'Regulatory portal'], trust: 89, quality: 92, risk: 'Medium' },
    { id: 'dom6', name: 'Clinical Evidence', departmentId: 'dep4', businessOwner: 'Chief Medical Officer', dataOwner: 'Tomás Rivera', steward: 'Emma Lewis', systems: ['EDC', 'CDMS', 'Document store'], trust: 79, quality: 84, risk: 'High' }
  ],
  cdes: [
    { id: 'cde1', name: 'Customer account status', domainId: 'dom1', owner: 'Billing service', source: 'Billing System', authoritative: 'Billing System of Record', classification: 'Confidential', impact: 'High' },
    { id: 'cde2', name: 'Customer churn propensity indicator', domainId: 'dom1', owner: 'Data science', source: 'Data warehouse', authoritative: 'Churn feature registry', classification: 'Personal', impact: 'Medium' },
    { id: 'cde3', name: 'Product unit price', domainId: 'dom2', owner: 'Master data team', source: 'ERP', authoritative: 'ERP price book', classification: 'Confidential', impact: 'Medium' },
    { id: 'cde4', name: 'Order line status', domainId: 'dom3', owner: 'Order platform', source: 'Order service', authoritative: 'Order Service state', classification: 'Internal', impact: 'Critical' },
    { id: 'cde5', name: 'On-hand inventory quantity', domainId: 'dom4', owner: 'IoT platform', source: 'IoT telemetry', authoritative: 'Warehouse IoT stream', classification: 'Internal', impact: 'Critical' },
    { id: 'cde6', name: 'Revenue recognition amount', domainId: 'dom5', owner: 'Finance systems', source: 'General Ledger', authoritative: 'GL system of record', classification: 'Restricted', impact: 'Critical' },
    { id: 'cde7', name: 'Trial patient cohort status', domainId: 'dom6', owner: 'Clinical data mgmt', source: 'EDC', authoritative: 'EDC source of truth', classification: 'Personal', impact: 'Critical' }
  ],
  qualityRules: [
    { id: 'qr1', cdeId: 'cde1', name: 'Account status completeness', dimension: 'Completeness', threshold: 99, current: 99.6, status: 'Pass' },
    { id: 'qr2', cdeId: 'cde2', name: 'Churn propensity recency', dimension: 'Timeliness', threshold: 95, current: 98.2, status: 'Pass' },
    { id: 'qr3', cdeId: 'cde3', name: 'Unit price validity vs price book', dimension: 'Validity', threshold: 98, current: 96.1, status: 'Fail' },
    { id: 'qr4', cdeId: 'cde4', name: 'Order line state integrity', dimension: 'Integrity', threshold: 99, current: 99.8, status: 'Pass' },
    { id: 'qr5', cdeId: 'cde5', name: 'Inventory sensor coherence', dimension: 'Consistency', threshold: 97, current: 93.4, status: 'Fail' },
    { id: 'qr6', cdeId: 'cde6', name: 'Revenue amount correctness', dimension: 'Accuracy', threshold: 99, current: 98.9, status: 'Pass' },
    { id: 'qr7', cdeId: 'cde7', name: 'Cohort consent coverage', dimension: 'Completeness', threshold: 100, current: 99.9, status: 'Pass' }
  ],
  dataProducts: [
    { id: 'dp1', name: 'Customer 360', domainId: 'dom1', owner: 'Aisha Blackwell', qualitySlo: 98, freshness: '1 hour', consumers: 34, cost: 62000, trust: 91 },
    { id: 'dp2', name: 'Customer churn features', domainId: 'dom1', owner: 'Aisha Blackwell', qualitySlo: 95, freshness: '15 minutes', consumers: 12, cost: 41000, trust: 88 },
    { id: 'dp3', name: 'Product reference data', domainId: 'dom2', owner: 'Lena Fischer', qualitySlo: 90, freshness: '1 day', consumers: 9, cost: 28000, trust: 78 },
    { id: 'dp4', name: 'Order fulfilment events', domainId: 'dom3', owner: 'Marcus Chen', qualitySlo: 97, freshness: '5 minutes', consumers: 21, cost: 54000, trust: 86 },
    { id: 'dp5', name: 'Real-time inventory', domainId: 'dom4', owner: 'Sofia Rossi', qualitySlo: 88, freshness: '1 minute', consumers: 16, cost: 47000, trust: 63 },
    { id: 'dp6', name: 'Regulatory ledger pack', domainId: 'dom5', owner: 'Priya Nair', qualitySlo: 96, freshness: '1 hour', consumers: 7, cost: 33000, trust: 90 },
    { id: 'dp7', name: 'Clinical evidence vault', domainId: 'dom6', owner: 'Emma Lewis', qualitySlo: 94, freshness: '1 day', consumers: 5, cost: 52000, trust: 81 }
  ],
  useCases: [
    { id: 'uc1', name: 'Order-to-cash agentic assistant', objectiveId: 'obj1', departmentId: 'dep2', dataProductId: 'dp4', aiType: 'Agentic RAG', owner: 'Daniel Lewis', value: 1600000, cost: 210000, risk: 'Medium', status: 'In Development', readiness: 64 },
    { id: 'uc2', name: 'Precision churn rescue', objectiveId: 'obj2', departmentId: 'dep1', dataProductId: 'dp2', aiType: 'Machine Learning', owner: 'Grace Adeyemi', value: 2200000, cost: 260000, risk: 'Low', status: 'In Production', readiness: 92 },
    { id: 'uc3', name: 'Autonomous demand forecasting', objectiveId: 'obj3', departmentId: 'dep3', dataProductId: 'dp5', aiType: 'Forecasting', owner: 'Oliver Grant', value: 1300000, cost: 180000, risk: 'Medium', status: 'In Development', readiness: 55 },
    { id: 'uc4', name: 'Regulatory report automation', objectiveId: 'obj4', departmentId: 'dep2', dataProductId: 'dp6', aiType: 'RAG', owner: 'Nora Hussain', value: 900000, cost: 140000, risk: 'High', status: 'In Review', readiness: 47 },
    { id: 'uc5', name: 'Clinical document summarisation', objectiveId: 'obj5', departmentId: 'dep4', dataProductId: 'dp7', aiType: 'GenAI', owner: 'Sam Barrett', value: 1900000, cost: 300000, risk: 'High', status: 'In Development', readiness: 38 },
    { id: 'uc6', name: 'New product scenario simulation', objectiveId: 'obj6', departmentId: 'dep4', dataProductId: 'dp3', aiType: 'No AI / Rules', owner: 'Elena Petrov', value: 700000, cost: 90000, risk: 'Low', status: 'Backlog', readiness: 12 },
    { id: 'uc7', name: 'Autonomous incident remediation agent', objectiveId: 'obj7', departmentId: 'dep2', dataProductId: 'dp6', aiType: 'Autonomous Agent', owner: 'Ravi Menon', value: 1500000, cost: 230000, risk: 'High', status: 'In Development', readiness: 41 }
  ],
  models: [
    { id: 'm1', useCaseId: 'uc2', name: 'Churn gradient boosting model', provider: 'Azure ML · LightGBM', quality: 94, latency: 0.21, status: 'Approved' },
    { id: 'm2', useCaseId: 'uc1', name: 'Order orchestration model', provider: 'Microsoft Foundry · GPT-5', quality: 91, latency: 0.8, status: 'Approved' },
    { id: 'm3', useCaseId: 'uc3', name: 'Hybrid demand forecaster', provider: 'Vertex AI · Prophet', quality: 86, latency: 0.32, status: 'In Review' },
    { id: 'm4', useCaseId: 'uc4', name: 'Regulatory retrieval model', provider: 'Microsoft Foundry', quality: 89, latency: 0.9, status: 'Draft' },
    { id: 'm5', useCaseId: 'uc5', name: 'Clinical summariser', provider: 'Vertex AI · Gemini', quality: 88, latency: 1.2, status: 'Draft' },
    { id: 'm6', useCaseId: 'uc7', name: 'Operational remediation agent model', provider: 'Amazon Bedrock · Claude', quality: 90, latency: 0.7, status: 'In Review' }
  ],
  rag: [
    { id: 'r1', useCaseId: 'uc1', name: 'Order & fulfilment knowledge base', type: 'Hybrid retrieval', trust: 84, source: 'Event streams + SOP PDFs', status: 'Healthy' },
    { id: 'r2', useCaseId: 'uc4', name: 'Regulatory search index', type: 'Vector index', trust: 82, source: 'Statute + precedent library', status: 'Healthy' },
    { id: 'r3', useCaseId: 'uc5', name: 'Clinical evidence index', type: 'Vector index', trust: 79, source: 'EDC + publication corpus', status: 'Warning' },
    { id: 'r4', useCaseId: 'uc7', name: 'Runbook knowledge base', type: 'Hybrid retrieval', trust: 87, source: 'SRE runbooks + alert history', status: 'Healthy' }
  ],
  mcpServers: [
    { id: 'ns1', useCaseId: 'uc1', name: 'ERP tools MCP', trust: 81, auth: 'OAuth 2.0 + mTLS', permissions: 'Read orders · write delivery notes', status: 'Approved' },
    { id: 'ns2', useCaseId: 'uc7', name: 'Infrastructure MCP', trust: 74, auth: 'Short-lived tokens', permissions: 'Read metrics · trigger remediations', status: 'Restricted' },
    { id: 'ns3', useCaseId: 'uc2', name: 'Feature store MCP', trust: 90, auth: 'Service identity', permissions: 'Read feature vectors', status: 'Approved' }
  ],
  agents: [
    { id: 'a1', useCaseId: 'uc1', name: 'Order-to-Cash Copilot', goal: 'Drive each order through to cash while staying inside the approval policy.', autonomy: 2, maxSteps: 12, budget: 4000, approval: 'Human approval for write actions', risk: 'Medium', status: 'Running', spent: 1260 },
    { id: 'a2', useCaseId: 'uc7', name: 'NightWatch Remediation', goal: 'Triage alerts and remediate incidents within the policy envelope.', autonomy: 3, maxSteps: 8, budget: 2500, approval: 'Approval required for blast radius > £500', risk: 'High', status: 'Paused', spent: 830 },
    { id: 'a3', useCaseId: 'uc2', name: 'Churn Retention Scout', goal: 'Surface at-risk accounts with a recommended retention action.', autonomy: 1, maxSteps: 6, budget: 1800, approval: 'Read-only recommendations', risk: 'Low', status: 'Running', spent: 420 }
  ],
  evals: [
    { id: 'ev1', useCaseId: 'uc1', name: 'Order-to-cash golden suite', type: 'Golden', score: 92, threshold: 88, status: 'Pass', lastRun: 'Today 09:12' },
    { id: 'ev2', useCaseId: 'uc1', name: 'Synthetic order flows', type: 'Synthetic', score: 85, threshold: 85, status: 'Pass', lastRun: 'Today 09:12' },
    { id: 'ev3', useCaseId: 'uc1', name: 'Tool-call safety suite', type: 'Safety', score: 96, threshold: 90, status: 'Pass', lastRun: 'Yesterday' },
    { id: 'ev4', useCaseId: 'uc2', name: 'Churn regression suite', type: 'Regression', score: 94, threshold: 90, status: 'Pass', lastRun: 'Today 08:41' },
    { id: 'ev5', useCaseId: 'uc2', name: 'Bias & fairness suite', type: 'Fairness', score: 97, threshold: 90, status: 'Pass', lastRun: 'Today 08:41' },
    { id: 'ev6', useCaseId: 'uc4', name: 'Regulatory hallucination guard', type: 'Safety', score: 78, threshold: 90, status: 'Fail', lastRun: 'Yesterday' },
    { id: 'ev7', useCaseId: 'uc5', name: 'Clinical grounding suite', type: 'Groundedness', score: 74, threshold: 85, status: 'Fail', lastRun: '2 days ago' },
    { id: 'ev8', useCaseId: 'uc7', name: 'Agentic task completion', type: 'Task completion', score: 81, threshold: 85, status: 'Fail', lastRun: '3 days ago' },
    { id: 'ev9', useCaseId: 'uc3', name: 'Forecast accuracy holdout', type: 'Regression', score: 88, threshold: 85, status: 'Pass', lastRun: 'Today 07:58' }
  ],
  incidents: [
    { id: 'inc1', title: 'Inference latency spike in churn model', impact: 'Delayed churn rescue recommendations for 20 minutes', severity: 'Medium', status: 'Open' },
    { id: 'inc2', title: 'Inventory sensor gap in warehouse 4', impact: 'Stale on-hand counts affecting demand forecasting', severity: 'High', status: 'Investigating' },
    { id: 'inc3', title: 'Regulatory index rebuild failed', impact: 'RAG fallback to passthrough for report automation', severity: 'Low', status: 'Closed' }
  ],
  decisions: [
    { id: 'AD-001', title: 'Adopt Microsoft Foundry as primary GenAI platform', owner: 'Architecture Council', status: 'Approved', date: '02 Jun 2026' },
    { id: 'AD-002', title: 'Standardise MCP trust tiers with OAuth + mTLS', owner: 'Architecture Council', status: 'Approved', date: '18 Jun 2026' },
    { id: 'AD-003', title: 'Use open table formats for governed data products', owner: 'Platform Board', status: 'In Review', date: '12 Aug 2026' }
  ],
  roadmap: [
    { phase: 1, name: 'Strategy', progress: 100 },
    { phase: 2, name: 'Governance Foundation', progress: 86 },
    { phase: 3, name: 'Data Foundations', progress: 62 },
    { phase: 4, name: 'Evals', progress: 41 },
    { phase: 5, name: 'Agentic AI', progress: 28 },
    { phase: 6, name: 'Autonomous Operations', progress: 12 }
  ]
});

const uid = (prefix) => `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 999)}`;

export const useStudioStore = create(persist((set, get) => ({
  ...seed(),
  activePage: 'Executive Home',
  selectedUseCaseId: null,
  notifications: [],

  addNotification: (text, type = 'info') => set(s => ({
    notifications: [...s.notifications, { id: uid('n'), text, type }].slice(-5)
  })),
  dismissNotification: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),

  setActivePage: (activePage) => set({ activePage, notifications: [] }),
  setSelectedUseCase: (selectedUseCaseId) => set({ selectedUseCaseId }),

  addDepartment: (d) => set(s => ({
    departments: [...s.departments, { id: uid('dep'), maturity: 45, ...d }]
  })),
  addDomain: (d) => set(s => ({
    domains: [...s.domains, { id: uid('dom'), trust: 60, quality: 70, risk: 'Low', systems: [], ...d }]
  })),
  addCde: (c) => set(s => ({
    cdes: [...s.cdes, { id: uid('cde'), owner: '', source: '', classification: 'Internal', impact: 'Medium', ...c }]
  })),
  addQualityRule: (q) => set(s => ({
    qualityRules: [...s.qualityRules, { id: uid('qr'), status: Number(q.current) >= Number(q.threshold) ? 'Pass' : 'Fail', ...q }]
  })),
  addDataProduct: (p) => set(s => ({
    dataProducts: [...s.dataProducts, { id: uid('dp'), consumers: 1, cost: 50000, trust: 80, ...p }]
  })),
  addUseCase: (u) => set(s => ({
    useCases: [...s.useCases, { id: uid('uc'), status: 'Backlog', readiness: 20, ...u }]
  })),

  runEval: (id) => set(s => ({
    evals: s.evals.map(e => e.id === id
      ? { ...e, status: e.score >= e.threshold ? 'Pass' : 'Fail', lastRun: 'Just now' }
      : e)
  })),

  setAgentStatus: (id, status) => set(s => ({ agents: s.agents.map(a => a.id === id ? { ...a, status } : a) })),
  setAgentAutonomy: (id, autonomy) => set(s => ({ agents: s.agents.map(a => a.id === id ? { ...a, autonomy } : a) })),

  addDecision: (d) => set(s => ({
    decisions: [{ id: `AD-${String(s.decisions.length + 1).padStart(3, '0')}`, status: 'Draft', date: 'Just now', ...d }, ...s.decisions]
  })),

  exportState: () => {
    const { activePage, selectedUseCaseId, notifications, ...rest } = get();
    return JSON.stringify(rest, null, 2);
  },
  resetDemo: () => set({ ...seed(), activePage: 'Executive Home', selectedUseCaseId: null, notifications: [] })
}), {
  name: 'enterprise-data-ai-os-workspace'
}));