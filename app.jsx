import React, { useMemo, useState, useCallback } from 'react';
import {
  Activity, AlertTriangle, Archive, ArrowRight, Bot, BrainCircuit, Building2, Check,
  CheckCircle2, ChevronDown, CircleDollarSign, Cloud, Database, Download, FileText,
  GitBranch, Gauge, Layers3, Network, PackageCheck, Play, Plus, RefreshCw, Route,
  Save, Search, ServerCog, ShieldCheck, Sparkles, Target, Upload, UserCog, Users,
  Workflow, X, Zap, LockKeyhole, Settings2, Pause, Square, CirclePlay, CircleStop,
  SlidersHorizontal, BookOpenCheck, Boxes, Milestone, TrendingUp, PanelTop, Eye,
  GitPullRequestArrow, ListChecks, WandSparkles
} from 'lucide-react';
import {
  ReactFlow, Background, Controls, MiniMap, MarkerType, useNodesState, useEdgesState,
  addEdge
} from '@xyflow/react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area
} from 'recharts';
import { useStudioStore } from './store';

const NAV = [
  ['Executive Home', Gauge],
  ['Digital Thread', GitBranch],
  ['Strategy Intake', Target],
  ['Data Foundations', Database],
  ['Use Case Studio', Sparkles],
  ['AI Engineering', BrainCircuit],
  ['Eval Studio', ListChecks],
  ['Architecture', Network],
  ['Agent Operations', Bot],
  ['Governance', ShieldCheck],
  ['FinOps & Value', CircleDollarSign],
  ['Roadmap', Milestone],
  ['Artifacts', Archive],
];

const CLOUD_MAP = {
  Azure: {
    data: 'Microsoft Fabric / OneLake', governance: 'Microsoft Purview', ml: 'Azure Machine Learning',
    genai: 'Microsoft Foundry', rag: 'Azure AI Search', runtime: 'AKS / Container Apps',
    integration: 'Azure Data Factory / Event Hubs', identity: 'Microsoft Entra ID', secrets: 'Azure Key Vault',
    observability: 'Azure Monitor / Application Insights'
  },
  AWS: {
    data: 'Amazon SageMaker Lakehouse / Amazon S3', governance: 'Amazon SageMaker Data and AI Governance',
    ml: 'Amazon SageMaker AI', genai: 'Amazon Bedrock', rag: 'Amazon Bedrock Knowledge Bases / OpenSearch',
    runtime: 'Amazon EKS / AWS Lambda', integration: 'AWS Glue / Amazon Kinesis', identity: 'AWS IAM',
    secrets: 'AWS KMS / Secrets Manager', observability: 'Amazon CloudWatch'
  },
  'Google Cloud': {
    data: 'BigQuery / Cloud Storage', governance: 'Dataplex Universal Catalog', ml: 'Vertex AI',
    genai: 'Vertex AI / Gemini models', rag: 'Vertex AI Search / vector search', runtime: 'GKE / Cloud Run',
    integration: 'Dataflow / Pub/Sub', identity: 'Cloud IAM', secrets: 'Secret Manager',
    observability: 'Cloud Monitoring / Cloud Trace'
  },
  SAP: {
    data: 'SAP Datasphere / SAP HANA', governance: 'SAP Master Data Governance', ml: 'SAP AI Core',
    genai: 'SAP Business AI / Joule', rag: 'SAP-managed knowledge integrations', runtime: 'SAP BTP',
    integration: 'SAP Integration Suite', identity: 'SAP Cloud Identity Services', secrets: 'BTP destination/security services',
    observability: 'SAP Cloud ALM / BTP monitoring'
  },
  Oracle: {
    data: 'Autonomous Database / Object Storage', governance: 'OCI Data Catalog', ml: 'OCI Data Science',
    genai: 'OCI Generative AI', rag: 'OCI Generative AI / Oracle Database vector capabilities', runtime: 'Oracle Kubernetes Engine',
    integration: 'OCI Data Integration / GoldenGate', identity: 'OCI IAM', secrets: 'OCI Vault', observability: 'OCI Monitoring / Logging'
  },
  Salesforce: {
    data: 'Salesforce Data Cloud', governance: 'Salesforce platform governance controls', ml: 'Einstein',
    genai: 'Agentforce', rag: 'Data Cloud retrieval and grounding', runtime: 'Salesforce Platform',
    integration: 'MuleSoft / Salesforce Flow', identity: 'Salesforce Identity', secrets: 'Salesforce platform credential controls',
    observability: 'Salesforce monitoring and audit capabilities'
  },
  'Open Source': {
    data: 'Iceberg / Delta Lake / PostgreSQL', governance: 'OpenMetadata / DataHub', ml: 'MLflow / Kubeflow',
    genai: 'Hugging Face / vLLM', rag: 'Qdrant / pgvector / OpenSearch', runtime: 'Kubernetes / KServe',
    integration: 'Airflow / Kafka / dbt', identity: 'OIDC / Keycloak', secrets: 'Vault', observability: 'OpenTelemetry / Prometheus / Grafana'
  }
};

const PAGES = Object.fromEntries(NAV.map(([name]) => [name, name]));
const RISK_SCORE = { Low: 25, Medium: 55, High: 82, Critical: 96 };
const riskTone = (risk) => risk === 'Low' ? 'good' : risk === 'Medium' ? 'warn' : 'bad';
const scoreTone = (n) => n >= 85 ? 'good' : n >= 70 ? 'warn' : 'bad';
const fmtMoney = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n || 0);

function Button({ children, onClick, variant='primary', icon: Icon, disabled=false, type='button', className='' }) {
  return <button type={type} disabled={disabled} className={`btn ${variant} ${className}`} onClick={onClick}>{Icon && <Icon size={16}/>}<span>{children}</span></button>;
}
function Badge({ children, tone='neutral' }) { return <span className={`badge ${tone}`}>{children}</span>; }
function Card({ children, className='', onClick }) { return <section className={`card ${className}`} onClick={onClick}>{children}</section>; }
function SectionTitle({ eyebrow, title, copy, action }) {
  return <div className="section-title"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{copy && <p>{copy}</p>}</div>{action}</div>;
}
function KPI({ label, value, detail, tone='blue', icon: Icon }) {
  return <Card className="kpi"><div className={`kpi-icon ${tone}`}>{Icon && <Icon size={18}/>}</div><div><div className="kpi-label">{label}</div><div className="kpi-value">{value}</div><div className="kpi-detail">{detail}</div></div></Card>;
}
function Progress({ value, label, tone='blue' }) {
  return <div className="progress-wrap">{label && <div className="progress-label"><span>{label}</span><strong>{Math.round(value)}%</strong></div>}<div className="progress"><span className={tone} style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div></div>;
}
function Empty({ title, copy }) { return <div className="empty"><Boxes size={28}/><strong>{title}</strong><span>{copy}</span></div>; }

function Modal({ title, children, onClose, width='680px' }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" style={{maxWidth:width}} onMouseDown={e=>e.stopPropagation()}>
    <div className="modal-head"><div><div className="eyebrow">Workspace action</div><h3>{title}</h3></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>{children}
  </div></div>;
}

function AppShell({ children }) {
  const activePage = useStudioStore(s=>s.activePage);
  const setActivePage = useStudioStore(s=>s.setActivePage);
  const organisation = useStudioStore(s=>s.organisation);
  const notifications = useStudioStore(s=>s.notifications);
  const dismissNotification = useStudioStore(s=>s.dismissNotification);
  const [search, setSearch] = useState('');
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><GitBranch size={22}/></div><div><strong>Data & AI OS</strong><span>Transformation control plane</span></div></div>
      <div className="org-chip"><Building2 size={15}/><div><span>Organisation</span><strong>{organisation.name}</strong></div></div>
      <nav>{NAV.map(([name, Icon]) => <button key={name} className={activePage===name?'active':''} onClick={()=>setActivePage(name)}><Icon size={17}/><span>{name}</span></button>)}</nav>
      <div className="sidebar-footer"><div className="trust-pill"><ShieldCheck size={15}/><span>Trusted AI starts with trusted data</span></div></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <div className="top-title"><span>Enterprise Data & AI Transformation Operating System</span><strong>{activePage}</strong></div>
        <div className="top-actions"><div className="search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search assets, controls, models..."/></div><Badge tone="good">Persistent workspace</Badge></div>
      </header>
      <div className="workspace">{children}</div>
      <div className="toast-stack">{notifications.map(n=><div key={n.id} className={`toast ${n.type}`}><span>{n.text}</span><button onClick={()=>dismissNotification(n.id)}><X size={14}/></button></div>)}</div>
    </main>
  </div>
}

function ExecutiveHome() {
  const s = useStudioStore();
  const trustAvg = Math.round(s.domains.reduce((a,d)=>a+d.trust,0)/Math.max(1,s.domains.length));
  const qualityAvg = Math.round(s.domains.reduce((a,d)=>a+d.quality,0)/Math.max(1,s.domains.length));
  const readinessAvg = Math.round(s.useCases.reduce((a,u)=>a+u.readiness,0)/Math.max(1,s.useCases.length));
  const evalPass = Math.round(100*s.evals.filter(e=>e.status==='Pass').length/Math.max(1,s.evals.length));
  const projectedValue = s.useCases.reduce((a,u)=>a+Number(u.value||0),0);
  const aiSpend = s.useCases.reduce((a,u)=>a+Number(u.cost||0),0);
  const ownerCoverage = Math.round(100*s.domains.filter(d=>d.dataOwner).length/Math.max(1,s.domains.length));
  const radar = [
    {k:'Strategy',v:82},{k:'Governance',v:74},{k:'Ownership',v:ownerCoverage},{k:'Quality',v:qualityAvg},{k:'AI readiness',v:readinessAvg},{k:'Operations',v:68}
  ];
  const dept = s.departments.map(d=>({name:d.name.split(' ')[0],maturity:d.maturity}));
  const portfolio = s.useCases.map(u=>({name:u.name.length>22?u.name.slice(0,20)+'…':u.name,value:Math.round(u.value/1000000*10)/10,cost:Math.round(u.cost/100000)/10,readiness:u.readiness}));
  const risk = [
    {name:'Low',value:s.useCases.filter(u=>u.risk==='Low').length},
    {name:'Medium',value:s.useCases.filter(u=>u.risk==='Medium').length},
    {name:'High',value:s.useCases.filter(u=>u.risk==='High').length}
  ];
  return <>
    <SectionTitle eyebrow="Executive control tower" title="One view from data trust to business value" copy="Trace strategy, ownership, data quality, AI readiness, operational risk, cost and realised value from a single control plane." action={<Button icon={GitBranch} onClick={()=>s.setActivePage(PAGES['Digital Thread'])}>Open digital thread</Button>}/>
    <div className="kpi-grid six">
      <KPI icon={Database} label="Data trust" value={`${trustAvg}%`} detail={`${s.domains.length} governed domains`} tone="teal"/>
      <KPI icon={ShieldCheck} label="Ownership coverage" value={`${ownerCoverage}%`} detail={`${s.domains.filter(d=>!d.dataOwner).length} gaps`} tone="teal"/>
      <KPI icon={BrainCircuit} label="AI readiness" value={`${readinessAvg}%`} detail={`${s.useCases.length} use cases`} tone="purple"/>
      <KPI icon={CheckCircle2} label="Eval pass rate" value={`${evalPass}%`} detail={`${s.evals.filter(e=>e.status==='Fail').length} release blockers`} tone="green"/>
      <KPI icon={CircleDollarSign} label="Projected value" value={fmtMoney(projectedValue)} detail={`AI portfolio cost ${fmtMoney(aiSpend)}`} tone="blue"/>
      <KPI icon={AlertTriangle} label="Open incidents" value={s.incidents.filter(i=>i.status!=='Closed').length} detail={`${s.incidents.filter(i=>i.severity==='High').length} high severity`} tone="amber"/>
    </div>
    <div className="grid two dashboard-grid">
      <Card><div className="card-head"><div><h3>Enterprise maturity profile</h3><p>Readiness across the connected operating model.</p></div><Badge tone={scoreTone(readinessAvg)}>{readinessAvg}% production readiness</Badge></div><div className="chart-lg"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radar}><PolarGrid/><PolarAngleAxis dataKey="k" tick={{fontSize:11}}/><Radar dataKey="v" fillOpacity={0.16}/></RadarChart></ResponsiveContainer></div></Card>
      <Card><div className="card-head"><div><h3>Department maturity</h3><p>Data and AI delivery capability by department.</p></div></div><div className="chart-lg"><ResponsiveContainer width="100%" height="100%"><BarChart data={dept}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis domain={[0,100]} tick={{fontSize:11}}/><Tooltip/><Bar dataKey="maturity" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></Card>
    </div>
    <div className="grid three">
      <Card className="span-2"><div className="card-head"><div><h3>AI portfolio, value vs cost</h3><p>Readiness determines how much of the projected value is credible.</p></div></div><div className="table-wrap"><table><thead><tr><th>Use case</th><th>Status</th><th>Readiness</th><th>Projected value</th><th>Cost</th><th>Risk</th></tr></thead><tbody>{s.useCases.map(u=><tr key={u.id} onClick={()=>{s.setSelectedUseCase(u.id);s.setActivePage('Use Case Studio')}}><td><strong>{u.name}</strong><span className="muted-cell">{u.aiType}</span></td><td><Badge tone="blue">{u.status}</Badge></td><td><Progress value={u.readiness}/></td><td>{fmtMoney(u.value)}</td><td>{fmtMoney(u.cost)}</td><td><Badge tone={riskTone(u.risk)}>{u.risk}</Badge></td></tr>)}</tbody></table></div></Card>
      <Card><div className="card-head"><div><h3>Governance risk</h3><p>Portfolio risk distribution.</p></div></div><div className="chart-md"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={risk} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>{risk.map((_,i)=><Cell key={i}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div><div className="legend-row">{risk.map(r=><span key={r.name}><i/> {r.name}: {r.value}</span>)}</div></Card>
    </div>
    <Card><div className="card-head"><div><h3>Transformation roadmap pulse</h3><p>Strategy through autonomous operations and enterprise scale.</p></div><Button variant="secondary" onClick={()=>s.setActivePage('Roadmap')} icon={ArrowRight}>Open roadmap</Button></div><div className="roadmap-strip">{s.roadmap.map(r=><div key={r.phase} className="roadmap-step"><div className="step-top"><span>{r.phase}</span><strong>{r.progress}%</strong></div><b>{r.name}</b><Progress value={r.progress} tone={r.progress>=70?'green':r.progress>=35?'amber':'purple'}/></div>)}</div></Card>
  </>;
}

function DigitalThread() {
  const s = useStudioStore();
  const uc = s.useCases.find(u=>u.id===s.selectedUseCaseId) || s.useCases[0];
  const obj = s.objectives.find(o=>o.id===uc?.objectiveId);
  const dept = s.departments.find(d=>d.id===uc?.departmentId);
  const dp = s.dataProducts.find(d=>d.id===uc?.dataProductId);
  const dom = s.domains.find(d=>d.id===dp?.domainId);
  const cde = s.cdes.find(c=>c.domainId===dom?.id);
  const rule = s.qualityRules.find(q=>q.cdeId===cde?.id);
  const model = s.models.find(m=>m.useCaseId===uc?.id);
  const rag = s.rag.find(r=>r.useCaseId===uc?.id);
  const agent = s.agents.find(a=>a.useCaseId===uc?.id);
  const mcp = s.mcpServers.find(m=>m.useCaseId===uc?.id);
  const ev = s.evals.find(e=>e.useCaseId===uc?.id);
  const incident = s.incidents.find(i=>i.impact.toLowerCase().includes((agent?.name||'___').split(' ')[0].toLowerCase()));
  const nodeData = [
    ['objective', 'Business objective', obj?.name, 'business'], ['department','Department',dept?.name,'business'],
    ['domain','Data domain',dom?.name,'data'], ['owner','Data owner',dom?.dataOwner||'Unassigned','data'],
    ['cde','Critical data element',cde?.name||'No CDE','data'], ['quality','Quality rule',rule?.name||'No rule','data'],
    ['product','Data product',dp?.name,'data'], ['usecase','AI use case',uc?.name,'ai'], ['model','Model',model?.name||'Unselected','ai'],
    ['rag','RAG index',rag?.name||'Not configured','ai'], ['agent','Agent',agent?.name||'Not configured','agent'],
    ['mcp','MCP server',mcp?.name||'Not configured','agent'], ['eval','Evaluation',ev?.name||'Not designed','control'],
    ['risk','Risk',uc?.risk,'control'], ['release','Release',uc?.status,'control'], ['ops','Operational telemetry',incident?.title||'Healthy','ops'],
    ['value','Business KPI',obj?.kpi ? `${obj.kpi} ${obj.target}` : 'No KPI','value']
  ];
  const nodes = nodeData.map((n,i)=>({id:n[0], position:{x:(i%6)*230,y:Math.floor(i/6)*170}, data:{label:<div className={`thread-node ${n[3]}`}><span>{n[1]}</span><strong>{n[2]||'Not linked'}</strong></div>}, type:'default'}));
  const ids=nodeData.map(n=>n[0]);
  const edges=ids.slice(0,-1).map((id,i)=>({id:`e-${id}`,source:id,target:ids[i+1],markerEnd:{type:MarkerType.ArrowClosed},animated:i>=7}));
  const [rfNodes,setNodes,onNodesChange]=useNodesState(nodes);
  const [rfEdges,setEdges,onEdgesChange]=useEdgesState(edges);
  const onConnect=useCallback(params=>setEdges(eds=>addEdge({...params,markerEnd:{type:MarkerType.ArrowClosed}},eds)),[setEdges]);
  return <>
    <SectionTitle eyebrow="Data-to-AI digital thread" title="Trace every AI outcome back to business intent and trusted data" copy="Select a use case, then inspect the connected objective, department, owner, CDE, quality rule, data product, model, RAG, agent, MCP, eval, release state, operational signal and KPI." action={<select className="select" value={uc?.id} onChange={e=>s.setSelectedUseCase(e.target.value)}>{s.useCases.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select>}/>
    <Card className="flow-card"><div className="flow-toolbar"><Badge tone={scoreTone(uc?.readiness||0)}>Production readiness {uc?.readiness||0}%</Badge><Badge tone={riskTone(uc?.risk)}>{uc?.risk} risk</Badge><span className="flow-note">Drag nodes. Zoom. Pan. Connect additional relationships.</span></div><div className="flow-canvas"><ReactFlow nodes={rfNodes} edges={rfEdges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView><MiniMap/><Controls/><Background gap={18}/></ReactFlow></div></Card>
    <div className="grid three">
      <Card><h3>Trust evidence</h3><div className="stack-list"><div><span>Data trust</span><strong>{dom?.trust||0}%</strong></div><div><span>Data quality</span><strong>{dom?.quality||0}%</strong></div><div><span>MCP trust</span><strong>{mcp?.trust||0}%</strong></div><div><span>Eval score</span><strong>{ev?.score||0}%</strong></div></div></Card>
      <Card><h3>Impact analysis</h3><p className="copy">If {cde?.name || 'the critical data element'} changes, the system flags downstream regression scope.</p><div className="impact-tags">{[dp?.name,model?.name,rag?.name,agent?.name,mcp?.name,obj?.kpi].filter(Boolean).map(x=><Badge key={x} tone="warn">{x}</Badge>)}</div><Button variant="secondary" icon={GitPullRequestArrow} onClick={()=>s.addNotification('Regression scope generated for connected downstream assets.','success')}>Generate regression scope</Button></Card>
      <Card><h3>Cause-to-impact graph</h3><p className="copy">Operational incidents remain linked to their data and AI dependencies instead of being treated as isolated technical events.</p>{incident?<div className="incident-mini"><AlertTriangle size={18}/><div><strong>{incident.title}</strong><span>{incident.impact}</span></div></div>:<Badge tone="good">No correlated incident</Badge>}</Card>
    </div>
  </>;
}

function StrategyIntake() {
  const s=useStudioStore();
  const [form,setForm]=useState(s.organisation);
  const [dept,setDept]=useState({name:'',owner:''});
  const [showDept,setShowDept]=useState(false);
  const save=()=>{useStudioStore.setState({organisation:form});s.addNotification('Organisation strategy saved to the persistent workspace.','success')};
  return <>
    <SectionTitle eyebrow="Business strategy intake" title="Start with business outcomes before selecting technology" copy="Capture the organisation context, strategic priorities, constraints, departments and target outcomes. The downstream AI lifecycle inherits this context." action={<Button icon={Save} onClick={save}>Save strategy</Button>}/>
    <div className="grid two">
      <Card><div className="form-grid two">{[
        ['name','Organisation'],['industry','Industry'],['countries','Countries'],['size','Organisation size'],['businessModel','Business model'],['budget','Budget'],['timeline','Timeline']
      ].map(([k,l])=><label key={k}><span>{l}</span><input value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}<label className="full"><span>Strategic priorities</span><textarea rows="3" value={form.priorities||''} onChange={e=>setForm({...form,priorities:e.target.value})}/></label><label className="full"><span>AI ambition</span><textarea rows="3" value={form.aiAmbition||''} onChange={e=>setForm({...form,aiAmbition:e.target.value})}/></label></div></Card>
      <Card><div className="card-head"><div><h3>Department operating scope</h3><p>Departments connect objectives to data domains and accountability.</p></div><Button variant="secondary" icon={Plus} onClick={()=>setShowDept(true)}>Add department</Button></div><div className="list-cards">{s.departments.map(d=><div className="list-card" key={d.id}><div className="list-icon"><Users size={18}/></div><div><strong>{d.name}</strong><span>{d.owner}</span></div><div className="list-end"><Badge tone={scoreTone(d.maturity)}>{d.maturity}% maturity</Badge></div></div>)}</div></Card>
    </div>
    <Card><div className="card-head"><div><h3>Business objectives</h3><p>Every objective should have a measurable KPI and target value.</p></div></div><div className="table-wrap"><table><thead><tr><th>Objective</th><th>Department</th><th>KPI</th><th>Target</th><th>Projected value</th></tr></thead><tbody>{s.objectives.map(o=><tr key={o.id}><td><strong>{o.name}</strong></td><td>{s.departments.find(d=>d.id===o.departmentId)?.name}</td><td>{o.kpi}</td><td><Badge tone="good">{o.target}</Badge></td><td>{fmtMoney(o.value)}</td></tr>)}</tbody></table></div></Card>
    {showDept&&<Modal title="Add department" onClose={()=>setShowDept(false)}><form onSubmit={e=>{e.preventDefault();s.addDepartment(dept);setDept({name:'',owner:''});setShowDept(false);s.addNotification('Department added and linked into the operating model.','success')}}><div className="form-grid"><label><span>Department name</span><input required value={dept.name} onChange={e=>setDept({...dept,name:e.target.value})}/></label><label><span>Executive owner</span><input required value={dept.owner} onChange={e=>setDept({...dept,owner:e.target.value})}/></label></div><div className="modal-actions"><Button variant="secondary" onClick={()=>setShowDept(false)}>Cancel</Button><Button type="submit" icon={Plus}>Add department</Button></div></form></Modal>}
  </>;
}

function DataFoundations() {
  const s=useStudioStore();
  const [modal,setModal]=useState(null);
  const [domain,setDomain]=useState({name:'',businessOwner:'',dataOwner:'',steward:'',departmentId:s.departments[0]?.id});
  const [cde,setCde]=useState({name:'',domainId:s.domains[0]?.id,owner:'',source:'',authoritative:'',classification:'Internal',impact:'High'});
  const [rule,setRule]=useState({cdeId:s.cdes[0]?.id,name:'',dimension:'Completeness',threshold:98,current:95});
  const [prod,setProd]=useState({name:'',domainId:s.domains[0]?.id,owner:'',qualitySlo:98,freshness:'1 hour'});
  return <>
    <SectionTitle eyebrow="Trusted data foundation" title="Ownership, critical data, quality and data products" copy="The system blocks credible AI readiness when ownership or quality foundations are missing." action={<div className="button-row"><Button variant="secondary" icon={Plus} onClick={()=>setModal('domain')}>Domain</Button><Button variant="secondary" icon={Plus} onClick={()=>setModal('cde')}>CDE</Button><Button variant="secondary" icon={Plus} onClick={()=>setModal('rule')}>Quality rule</Button><Button icon={Plus} onClick={()=>setModal('product')}>Data product</Button></div>}/>
    <div className="grid three">
      {s.domains.map(d=><Card key={d.id}><div className="card-head"><div><div className="eyebrow">{d.id}</div><h3>{d.name}</h3></div><Badge tone={riskTone(d.risk)}>{d.risk}</Badge></div><div className="metric-pair"><div><span>Trust score</span><strong>{d.trust}%</strong></div><div><span>Quality</span><strong>{d.quality}%</strong></div></div><Progress value={d.trust} tone={d.trust>=85?'green':'teal'}/><div className="stack-list compact"><div><span>Business owner</span><strong>{d.businessOwner}</strong></div><div><span>Data owner</span><strong>{d.dataOwner||'Unassigned'}</strong></div><div><span>Steward</span><strong>{d.steward}</strong></div><div><span>Systems</span><strong>{d.systems.join(', ')||'None'}</strong></div></div></Card>)}
    </div>
    <div className="grid two">
      <Card><div className="card-head"><div><h3>Critical data elements</h3><p>Fields with material business, regulatory or AI impact.</p></div></div><div className="table-wrap"><table><thead><tr><th>CDE</th><th>Domain</th><th>Source of truth</th><th>Classification</th><th>Impact</th></tr></thead><tbody>{s.cdes.map(c=><tr key={c.id}><td><strong>{c.name}</strong><span className="muted-cell">{c.owner}</span></td><td>{s.domains.find(d=>d.id===c.domainId)?.name}</td><td>{c.authoritative}</td><td><Badge tone={c.classification==='Personal'?'warn':'neutral'}>{c.classification}</Badge></td><td><Badge tone={riskTone(c.impact==='Critical'?'High':c.impact==='High'?'Medium':'Low')}>{c.impact}</Badge></td></tr>)}</tbody></table></div></Card>
      <Card><div className="card-head"><div><h3>Data quality control plane</h3><p>Release readiness inherits failed quality controls.</p></div></div><div className="quality-list">{s.qualityRules.map(q=><div key={q.id} className="quality-row"><div><strong>{q.name}</strong><span>{q.dimension} · threshold {q.threshold}%</span></div><div className="quality-score"><strong>{q.current}%</strong><Badge tone={q.status==='Pass'?'good':'bad'}>{q.status}</Badge></div></div>)}</div></Card>
    </div>
    <Card><div className="card-head"><div><h3>Data products</h3><p>Consumable governed data assets for analytics and AI.</p></div></div><div className="data-product-grid">{s.dataProducts.map(p=><div key={p.id} className="product-card"><div className="product-top"><Database size={19}/><Badge tone={scoreTone(p.trust)}>Trust {p.trust}%</Badge></div><strong>{p.name}</strong><span>{s.domains.find(d=>d.id===p.domainId)?.name} domain</span><div className="mini-grid"><div><span>Quality SLO</span><b>{p.qualitySlo}%</b></div><div><span>Freshness</span><b>{p.freshness}</b></div><div><span>Consumers</span><b>{p.consumers}</b></div><div><span>Monthly cost</span><b>{fmtMoney(p.cost)}</b></div></div></div>)}</div></Card>
    {modal==='domain'&&<Modal title="Create data domain" onClose={()=>setModal(null)}><form onSubmit={e=>{e.preventDefault();s.addDomain(domain);setModal(null);s.addNotification('Data domain created.','success')}}><div className="form-grid two"><label><span>Name</span><input required value={domain.name} onChange={e=>setDomain({...domain,name:e.target.value})}/></label><label><span>Department</span><select value={domain.departmentId} onChange={e=>setDomain({...domain,departmentId:e.target.value})}>{s.departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label><span>Business owner</span><input required value={domain.businessOwner} onChange={e=>setDomain({...domain,businessOwner:e.target.value})}/></label><label><span>Data owner</span><input value={domain.dataOwner} onChange={e=>setDomain({...domain,dataOwner:e.target.value})}/></label><label className="full"><span>Data steward</span><input value={domain.steward} onChange={e=>setDomain({...domain,steward:e.target.value})}/></label></div><div className="modal-actions"><Button type="submit" icon={Plus}>Create domain</Button></div></form></Modal>}
    {modal==='cde'&&<Modal title="Create critical data element" onClose={()=>setModal(null)}><form onSubmit={e=>{e.preventDefault();s.addCde(cde);setModal(null);s.addNotification('Critical data element registered.','success')}}><div className="form-grid two"><label><span>Name</span><input required value={cde.name} onChange={e=>setCde({...cde,name:e.target.value})}/></label><label><span>Domain</span><select value={cde.domainId} onChange={e=>setCde({...cde,domainId:e.target.value})}>{s.domains.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label><span>Owner</span><input value={cde.owner} onChange={e=>setCde({...cde,owner:e.target.value})}/></label><label><span>Source system</span><input value={cde.source} onChange={e=>setCde({...cde,source:e.target.value})}/></label><label><span>Authoritative source</span><input value={cde.authoritative} onChange={e=>setCde({...cde,authoritative:e.target.value})}/></label><label><span>Classification</span><select value={cde.classification} onChange={e=>setCde({...cde,classification:e.target.value})}><option>Internal</option><option>Confidential</option><option>Personal</option><option>Restricted</option></select></label></div><div className="modal-actions"><Button type="submit" icon={Plus}>Register CDE</Button></div></form></Modal>}
    {modal==='rule'&&<Modal title="Create data quality rule" onClose={()=>setModal(null)}><form onSubmit={e=>{e.preventDefault();s.addQualityRule(rule);setModal(null);s.addNotification('Quality rule added and evaluated.','success')}}><div className="form-grid two"><label><span>CDE</span><select value={rule.cdeId} onChange={e=>setRule({...rule,cdeId:e.target.value})}>{s.cdes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label><span>Rule name</span><input required value={rule.name} onChange={e=>setRule({...rule,name:e.target.value})}/></label><label><span>Dimension</span><select value={rule.dimension} onChange={e=>setRule({...rule,dimension:e.target.value})}>{['Accuracy','Completeness','Consistency','Validity','Timeliness','Uniqueness','Integrity','Conformity','Freshness'].map(x=><option key={x}>{x}</option>)}</select></label><label><span>Threshold %</span><input type="number" min="0" max="100" value={rule.threshold} onChange={e=>setRule({...rule,threshold:e.target.value})}/></label><label><span>Current score %</span><input type="number" min="0" max="100" value={rule.current} onChange={e=>setRule({...rule,current:e.target.value})}/></label></div><div className="modal-actions"><Button type="submit" icon={Plus}>Create rule</Button></div></form></Modal>}
    {modal==='product'&&<Modal title="Create data product" onClose={()=>setModal(null)}><form onSubmit={e=>{e.preventDefault();s.addDataProduct(prod);setModal(null);s.addNotification('Data product created and linked to its domain.','success')}}><div className="form-grid two"><label><span>Product name</span><input required value={prod.name} onChange={e=>setProd({...prod,name:e.target.value})}/></label><label><span>Domain</span><select value={prod.domainId} onChange={e=>setProd({...prod,domainId:e.target.value})}>{s.domains.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label><span>Product owner</span><input required value={prod.owner} onChange={e=>setProd({...prod,owner:e.target.value})}/></label><label><span>Quality SLO %</span><input type="number" value={prod.qualitySlo} onChange={e=>setProd({...prod,qualitySlo:e.target.value})}/></label><label><span>Freshness SLO</span><input value={prod.freshness} onChange={e=>setProd({...prod,freshness:e.target.value})}/></label></div><div className="modal-actions"><Button type="submit" icon={Plus}>Create data product</Button></div></form></Modal>}
  </>;
}

function UseCaseStudio() {
  const s=useStudioStore();
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({name:'',objectiveId:s.objectives[0]?.id,departmentId:s.departments[0]?.id,dataProductId:s.dataProducts[0]?.id,aiType:'RAG',owner:'',value:500000,cost:100000,risk:'Medium'});
  const uc=s.useCases.find(u=>u.id===s.selectedUseCaseId)||s.useCases[0];
  const dp=s.dataProducts.find(d=>d.id===uc?.dataProductId);
  const dom=s.domains.find(d=>d.id===dp?.domainId);
  const failedQuality=s.qualityRules.filter(q=>s.cdes.some(c=>c.domainId===dom?.id&&c.id===q.cdeId)&&q.status==='Fail');
  const fit = uc?.aiType.includes('Agent') ? ['Agentic AI','RAG','Human approval'] : uc?.aiType.includes('ML') ? ['Machine Learning','Analytics','Continuous evaluation'] : ['Generative AI','RAG','Evaluation-first'];
  const blockers=[!dom?.dataOwner&&'Assign data owner',failedQuality.length>0&&`${failedQuality.length} data quality rule(s) failing`,uc?.risk==='High'&&'High-risk use case requires governance approval',!s.evals.some(e=>e.useCaseId===uc?.id&&e.status==='Pass')&&'No passing evaluation suite'].filter(Boolean);
  return <>
    <SectionTitle eyebrow="Use case studio" title="Decide whether AI is appropriate, then bind it to data, risk, cost and value" copy="Every use case inherits a business objective, department, data product, trust context and measurable outcome." action={<Button icon={Plus} onClick={()=>setShow(true)}>Create use case</Button>}/>
    <div className="usecase-layout"><Card className="usecase-list"><div className="card-head"><div><h3>Portfolio</h3><p>{s.useCases.length} connected use cases</p></div></div>{s.useCases.map(u=><button key={u.id} className={`uc-row ${u.id===uc?.id?'active':''}`} onClick={()=>s.setSelectedUseCase(u.id)}><div><strong>{u.name}</strong><span>{u.departmentId && s.departments.find(d=>d.id===u.departmentId)?.name} · {u.status}</span></div><div><Badge tone={riskTone(u.risk)}>{u.risk}</Badge><span className="score-num">{u.readiness}%</span></div></button>)}</Card>
      <div className="uc-detail">
        <Card><div className="card-head"><div><div className="eyebrow">{uc?.id} · {uc?.status}</div><h2 className="detail-title">{uc?.name}</h2><p>{uc?.aiType}</p></div><Badge tone={scoreTone(uc?.readiness||0)}>Readiness {uc?.readiness}%</Badge></div><div className="grid three compact-grid"><div className="metric-box"><span>Projected value</span><strong>{fmtMoney(uc?.value)}</strong></div><div className="metric-box"><span>Estimated cost</span><strong>{fmtMoney(uc?.cost)}</strong></div><div className="metric-box"><span>Value / cost</span><strong>{((uc?.value||0)/Math.max(1,uc?.cost||1)).toFixed(1)}×</strong></div></div></Card>
        <div className="grid two">
          <Card><h3>AI fit engine</h3><p className="copy">Recommended solution pattern based on the selected use case.</p><div className="fit-chain">{fit.map((x,i)=><React.Fragment key={x}><span>{x}</span>{i<fit.length-1&&<ArrowRight size={16}/>}</React.Fragment>)}</div><div className="decision-box"><strong>Decision</strong><span>Use AI only where the use case requires probabilistic reasoning, retrieval, prediction or controlled action. Keep deterministic controls outside the model.</span></div></Card>
          <Card><h3>Production blockers</h3>{blockers.length?<div className="blocker-list">{blockers.map(b=><div key={b}><AlertTriangle size={16}/><span>{b}</span></div>)}</div>:<div className="success-panel"><CheckCircle2 size={22}/><div><strong>No critical blockers</strong><span>All current release prerequisites are satisfied.</span></div></div>}<Button variant="secondary" icon={ListChecks} onClick={()=>s.setActivePage('Eval Studio')}>Open release gates</Button></Card>
        </div>
        <Card><div className="card-head"><div><h3>Connected enterprise context</h3><p>Business and data links inherited by this use case.</p></div></div><div className="context-chain">{[
          ['Objective',s.objectives.find(o=>o.id===uc?.objectiveId)?.name],['Department',s.departments.find(d=>d.id===uc?.departmentId)?.name],['Data product',dp?.name],['Data domain',dom?.name],['Data owner',dom?.dataOwner],['Data trust',`${dom?.trust||0}%`]
        ].map(([a,b],i)=><React.Fragment key={a}><div><span>{a}</span><strong>{b||'Not linked'}</strong></div>{i<5&&<ArrowRight size={16}/>}</React.Fragment>)}</div></Card>
      </div>
    </div>
    {show&&<Modal title="Create AI use case" onClose={()=>setShow(false)} width="760px"><form onSubmit={e=>{e.preventDefault();s.addUseCase(form);setShow(false);s.addNotification('Use case created. Readiness starts low until data, eval and governance evidence is linked.','success')}}><div className="form-grid two"><label className="full"><span>Use case name</span><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label><span>Business objective</span><select value={form.objectiveId} onChange={e=>setForm({...form,objectiveId:e.target.value})}>{s.objectives.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label><label><span>Department</span><select value={form.departmentId} onChange={e=>setForm({...form,departmentId:e.target.value})}>{s.departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label><span>Data product</span><select value={form.dataProductId} onChange={e=>setForm({...form,dataProductId:e.target.value})}>{s.dataProducts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label><label><span>AI pattern</span><select value={form.aiType} onChange={e=>setForm({...form,aiType:e.target.value})}>{['No AI / Rules','Analytics','Machine Learning','Forecasting','GenAI','RAG','Agentic RAG','Multi-Agent','Autonomous Agent','AIOps'].map(x=><option key={x}>{x}</option>)}</select></label><label><span>Owner</span><input required value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})}/></label><label><span>Risk</span><select value={form.risk} onChange={e=>setForm({...form,risk:e.target.value})}>{['Low','Medium','High'].map(x=><option key={x}>{x}</option>)}</select></label><label><span>Projected value £</span><input type="number" value={form.value} onChange={e=>setForm({...form,value:Number(e.target.value)})}/></label><label><span>Estimated cost £</span><input type="number" value={form.cost} onChange={e=>setForm({...form,cost:Number(e.target.value)})}/></label></div><div className="modal-actions"><Button type="submit" icon={Plus}>Create use case</Button></div></form></Modal>}
  </>;
}

function AIEngineering() {
  const s=useStudioStore();
  const uc=s.useCases.find(u=>u.id===s.selectedUseCaseId)||s.useCases[0];
  const model=s.models.find(m=>m.useCaseId===uc?.id);
  const rag=s.rag.find(r=>r.useCaseId===uc?.id);
  const mcp=s.mcpServers.find(m=>m.useCaseId===uc?.id);
  const agent=s.agents.find(a=>a.useCaseId===uc?.id);
  const lifecycle=['Requirement','Acceptance criteria','Risk','Evaluation','Build','Test','Approve','Deploy'];
  const ragFlow=['Source','Ingest','Parse','Chunk','Embed','Index','Retrieve','Rerank','Context','Generate','Cite','Evaluate'];
  const mlops=['Data','Features','Train','Experiment','Evaluate','Register','Approve','Deploy','Serve','Monitor','Drift','Retrain'];
  return <>
    <SectionTitle eyebrow="Evaluation-first AI engineering" title="Design the model, RAG, MCP and agent as governed system components" copy="The engineering flow defines acceptance criteria and evaluation before build and deployment." action={<select className="select" value={uc?.id} onChange={e=>s.setSelectedUseCase(e.target.value)}>{s.useCases.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select>}/>
    <Card><div className="card-head"><div><h3>Evaluation-first lifecycle</h3><p>Build cannot outrun measurable acceptance criteria.</p></div><Badge tone="good">Policy enforced</Badge></div><div className="lifecycle">{lifecycle.map((x,i)=><React.Fragment key={x}><div className={i<4?'prebuild':''}><span>{String(i+1).padStart(2,'0')}</span><strong>{x}</strong></div>{i<lifecycle.length-1&&<ArrowRight size={17}/>}</React.Fragment>)}</div></Card>
    <div className="grid four">
      <Card><div className="component-icon purple"><BrainCircuit/></div><h3>Model strategy</h3><strong className="component-name">{model?.name||'No model selected'}</strong><div className="stack-list compact"><div><span>Provider</span><strong>{model?.provider||'—'}</strong></div><div><span>Quality</span><strong>{model?.quality||0}%</strong></div><div><span>Latency</span><strong>{model?.latency||0}s</strong></div><div><span>Status</span><Badge tone={model?.status==='Approved'?'good':'warn'}>{model?.status||'Missing'}</Badge></div></div></Card>
      <Card><div className="component-icon teal"><BookOpenCheck/></div><h3>RAG / KnowledgeOps</h3><strong className="component-name">{rag?.name||'Not configured'}</strong><div className="stack-list compact"><div><span>Pattern</span><strong>{rag?.type||'—'}</strong></div><div><span>Knowledge trust</span><strong>{rag?.trust||0}%</strong></div><div><span>Source</span><strong>{rag?.source||'—'}</strong></div><div><span>Status</span><Badge tone={rag?.status==='Healthy'?'good':'warn'}>{rag?.status||'Missing'}</Badge></div></div></Card>
      <Card><div className="component-icon blue"><ServerCog/></div><h3>MCP control plane</h3><strong className="component-name">{mcp?.name||'Not configured'}</strong><div className="stack-list compact"><div><span>Trust score</span><strong>{mcp?.trust||0}%</strong></div><div><span>Authentication</span><strong>{mcp?.auth||'—'}</strong></div><div><span>Permissions</span><strong>{mcp?.permissions||'—'}</strong></div><div><span>Status</span><Badge tone={mcp?.status==='Approved'?'good':'warn'}>{mcp?.status||'Missing'}</Badge></div></div></Card>
      <Card><div className="component-icon purple"><Bot/></div><h3>Agent design</h3><strong className="component-name">{agent?.name||'Not configured'}</strong><div className="stack-list compact"><div><span>Autonomy</span><strong>Level {agent?.autonomy||0}</strong></div><div><span>Max steps</span><strong>{agent?.maxSteps||0}</strong></div><div><span>Budget</span><strong>{fmtMoney(agent?.budget||0)}</strong></div><div><span>Approval</span><strong>{agent?.approval||'—'}</strong></div></div></Card>
    </div>
    <div className="grid two">
      <Card><h3>RAG lifecycle</h3><div className="pipeline-wrap">{ragFlow.map((x,i)=><div className="pipeline-step" key={x}><span>{i+1}</span><strong>{x}</strong></div>)}</div></Card>
      <Card><h3>MLOps lifecycle</h3><div className="pipeline-wrap">{mlops.map((x,i)=><div className="pipeline-step" key={x}><span>{i+1}</span><strong>{x}</strong></div>)}</div></Card>
    </div>
  </>;
}

function EvalStudio() {
  const s=useStudioStore();
  const uc=s.useCases.find(u=>u.id===s.selectedUseCaseId)||s.useCases[0];
  const evals=s.evals.filter(e=>e.useCaseId===uc?.id);
  const dom=s.domains.find(d=>d.id===s.dataProducts.find(dp=>dp.id===uc?.dataProductId)?.domainId);
  const mcp=s.mcpServers.find(m=>m.useCaseId===uc?.id);
  const gates=[
    ['Model quality',s.models.some(m=>m.useCaseId===uc?.id&&m.quality>=88)],
    ['RAG quality',s.rag.some(r=>r.useCaseId===uc?.id&&r.trust>=85)],
    ['Agent quality',!uc?.aiType.includes('Agent')||s.agents.some(a=>a.useCaseId===uc?.id)],
    ['Data trust',(dom?.trust||0)>=80],['Data quality',(dom?.quality||0)>=85],['Security',(mcp?.trust||100)>=75],
    ['Governance',uc?.risk!=='High'||s.decisions.some(d=>d.status==='Approved')],['Cost',(uc?.cost||0)<=(uc?.value||0)*0.3],
    ['Operational readiness',(uc?.readiness||0)>=70],['Human approval',true]
  ];
  const pass=gates.filter(g=>g[1]).length;
  const release=pass===gates.length && evals.every(e=>e.status==='Pass');
  const metrics=[{name:'Accuracy',score:93},{name:'Groundedness',score:91},{name:'Citation accuracy',score:89},{name:'Safety',score:97},{name:'Task completion',score:90},{name:'Latency',score:86}];
  return <>
    <SectionTitle eyebrow="AI eval studio" title="Evidence before release" copy="Model, RAG, agent, safety, data, security, cost and human-approval gates combine into a single release decision." action={<select className="select" value={uc?.id} onChange={e=>s.setSelectedUseCase(e.target.value)}>{s.useCases.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select>}/>
    <div className="release-banner"><div className={release?'release-icon good':'release-icon bad'}>{release?<CheckCircle2/>:<LockKeyhole/>}</div><div><span>Release decision</span><strong>{release?'PRODUCTION RELEASE APPROVED':'PRODUCTION RELEASE BLOCKED'}</strong><p>{pass}/{gates.length} quality gates pass. All evaluation suites must also pass.</p></div><Badge tone={release?'good':'bad'}>{release?'Approved':'Blocked'}</Badge></div>
    <div className="grid two">
      <Card><div className="card-head"><div><h3>Release quality gates</h3><p>Cross-functional checks required before production.</p></div></div><div className="gate-grid">{gates.map(([name,ok])=><div key={name} className={`gate ${ok?'pass':'fail'}`}>{ok?<Check size={16}/>:<X size={16}/>}<span>{name}</span><b>{ok?'PASS':'FAIL'}</b></div>)}</div></Card>
      <Card><div className="card-head"><div><h3>Evaluation profile</h3><p>Representative multidimensional AI quality metrics.</p></div></div><div className="chart-md"><ResponsiveContainer width="100%" height="100%"><RadarChart data={metrics}><PolarGrid/><PolarAngleAxis dataKey="name" tick={{fontSize:10}}/><Radar dataKey="score" fillOpacity={0.18}/></RadarChart></ResponsiveContainer></div></Card>
    </div>
    <Card><div className="card-head"><div><h3>Evaluation suites</h3><p>Golden, production, synthetic, adversarial, edge-case and safety datasets can feed these suites.</p></div><Button variant="secondary" icon={RefreshCw} onClick={()=>evals.forEach(e=>s.runEval(e.id))}>Run all</Button></div><div className="table-wrap"><table><thead><tr><th>Suite</th><th>Type</th><th>Score</th><th>Threshold</th><th>Status</th><th>Last run</th><th></th></tr></thead><tbody>{evals.map(e=><tr key={e.id}><td><strong>{e.name}</strong></td><td>{e.type}</td><td>{e.score}%</td><td>{e.threshold}%</td><td><Badge tone={e.status==='Pass'?'good':'bad'}>{e.status}</Badge></td><td>{e.lastRun}</td><td><Button variant="ghost" icon={Play} onClick={()=>{s.runEval(e.id);s.addNotification(`${e.name} evaluation executed.`,'success')}}>Run</Button></td></tr>)}</tbody></table></div></Card>
  </>;
}

function Architecture() {
  const s=useStudioStore();
  const [cloud,setCloud]=useState('Azure');
  const uc=s.useCases.find(u=>u.id===s.selectedUseCaseId)||s.useCases[0];
  const map=CLOUD_MAP[cloud];
  const layers=[
    ['client','BUSINESS','Business process','business'],['api','APPLICATION','Experience / API','app'],['integration','INTEGRATION',map.integration,'app'],
    ['product','DATA PRODUCT',s.dataProducts.find(d=>d.id===uc?.dataProductId)?.name||'Governed data product','data'],['data','DATA PLATFORM',map.data,'data'],
    ['governance','GOVERNANCE',map.governance,'control'],['rag','RAG / KNOWLEDGE',map.rag,'ai'],['model','MODEL',map.genai,'ai'],
    ['agent','AGENT',s.agents.find(a=>a.useCaseId===uc?.id)?.name||'Controlled agent','agent'],['mcp','MCP / TOOLS',s.mcpServers.find(m=>m.useCaseId===uc?.id)?.name||'Tool control plane','agent'],
    ['serve','MODEL SERVING',map.runtime,'ops'],['observe','OPERATIONS',map.observability,'ops'],['security','SECURITY',`${map.identity} + ${map.secrets}`,'control']
  ];
  const nodes=layers.map((n,i)=>({id:n[0],position:{x:(i%4)*280,y:Math.floor(i/4)*190},data:{label:<div className={`arch-node ${n[3]}`}><span>{n[1]}</span><strong>{n[2]}</strong></div>}}));
  const edges=layers.slice(0,-1).map((n,i)=>({id:`a${i}`,source:n[0],target:layers[i+1][0],markerEnd:{type:MarkerType.ArrowClosed},animated:i>=5}));
  const [rfNodes,setNodes,onNodesChange]=useNodesState(nodes);
  const [rfEdges,setEdges,onEdgesChange]=useEdgesState(edges);
  React.useEffect(()=>{setNodes(nodes);setEdges(edges)},[cloud,uc?.id]);
  const onConnect=useCallback(params=>setEdges(eds=>addEdge({...params,markerEnd:{type:MarkerType.ArrowClosed}},eds)),[setEdges]);
  return <>
    <SectionTitle eyebrow="Architecture designer" title="Editable multi-cloud reference architecture" copy="Generate architecture from the selected use case, then drag, reconnect and inspect the technology decision rationale." action={<div className="button-row"><select className="select" value={cloud} onChange={e=>setCloud(e.target.value)}>{Object.keys(CLOUD_MAP).map(c=><option key={c}>{c}</option>)}</select><Button icon={WandSparkles} onClick={()=>s.addNotification(`${cloud} architecture regenerated from current use-case dependencies.`,'success')}>Generate</Button></div>}/>
    <Card className="flow-card"><div className="flow-toolbar"><Badge tone="purple">{uc?.name}</Badge><Badge tone="blue">{cloud}</Badge><span className="flow-note">Editable architecture. Drag, pan, zoom and reconnect nodes.</span></div><div className="flow-canvas architecture"><ReactFlow nodes={rfNodes} edges={rfEdges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView><MiniMap/><Controls/><Background gap={18}/></ReactFlow></div></Card>
    <Card><div className="card-head"><div><h3>Technology decision engine</h3><p>Managed recommendation with platform-neutral alternatives.</p></div></div><div className="table-wrap"><table><thead><tr><th>Capability</th><th>Recommended technology</th><th>Decision rationale</th><th>Open-source alternative</th></tr></thead><tbody>{[
      ['Data platform',map.data,'Governed analytics and AI-ready data foundation','Iceberg / Delta Lake'],['Governance',map.governance,'Ownership, classification, lineage and controls','OpenMetadata / DataHub'],['ML engineering',map.ml,'Experiment, registry and managed model lifecycle','MLflow / Kubeflow'],['Generative AI',map.genai,'Managed model and agent capabilities','Hugging Face / vLLM'],['RAG',map.rag,'Enterprise retrieval and grounding','Qdrant / pgvector / OpenSearch'],['Runtime',map.runtime,'Production serving and scaling','Kubernetes / KServe'],['Observability',map.observability,'Logs, metrics and traces','OpenTelemetry / Prometheus / Grafana']
    ].map(r=><tr key={r[0]}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody></table></div></Card>
  </>;
}

function AgentOperations() {
  const s=useStudioStore();
  const [selected,setSelected]=useState(s.agents[0]?.id);
  const a=s.agents.find(x=>x.id===selected)||s.agents[0];
  const uc=s.useCases.find(u=>u.id===a?.useCaseId);
  const mcp=s.mcpServers.find(m=>m.useCaseId===a?.useCaseId);
  const setStatus=(status)=>{s.setAgentStatus(a.id,status);s.addNotification(`${a.name} set to ${status}.`,status==='Running'?'success':'info')};
  const envelope=[['Allowed goals',a?.goal],['Allowed actions',mcp?.permissions||'No tools'],['Maximum spend',fmtMoney(a?.budget)],['Maximum runtime','15 minutes per run'],['Maximum API calls',`${(a?.maxSteps||5)*3} per run`],['Geography','Approved enterprise regions'],['Human approval',a?.approval],['Risk',a?.risk]];
  return <>
    <SectionTitle eyebrow="Autonomous agent control centre" title="Operate agents inside explicit autonomy envelopes" copy="Pause, resume or stop agents, reduce autonomy, inspect tool access, cost and approval boundaries."/>
    <div className="agent-control-layout"><Card className="agent-list"><h3>Agent fleet</h3>{s.agents.map(x=><button key={x.id} className={x.id===a?.id?'active':''} onClick={()=>setSelected(x.id)}><div className={`agent-status ${x.status.toLowerCase()}`}/><div><strong>{x.name}</strong><span>{s.useCases.find(u=>u.id===x.useCaseId)?.name}</span></div><Badge tone={x.status==='Running'?'good':x.status==='Paused'?'warn':'bad'}>{x.status}</Badge></button>)}</Card>
      <div className="agent-detail">
        <div className="grid four"><KPI label="Autonomy" value={`L${a?.autonomy}`} detail="0 assistive · 4 bounded autonomous" icon={SlidersHorizontal} tone="purple"/><KPI label="Spend" value={fmtMoney(a?.spent)} detail={`of ${fmtMoney(a?.budget)} envelope`} icon={CircleDollarSign} tone="blue"/><KPI label="Max steps" value={a?.maxSteps} detail="per execution" icon={Route} tone="teal"/><KPI label="Risk" value={a?.risk} detail={uc?.name} icon={AlertTriangle} tone="amber"/></div>
        <Card><div className="card-head"><div><div className="eyebrow">{a?.id}</div><h2 className="detail-title">{a?.name}</h2><p>{a?.goal}</p></div><Badge tone={a?.status==='Running'?'good':'warn'}>{a?.status}</Badge></div><div className="agent-actions"><Button variant="secondary" icon={CirclePlay} onClick={()=>setStatus('Running')}>Resume</Button><Button variant="secondary" icon={Pause} onClick={()=>setStatus('Paused')}>Pause</Button><Button variant="danger" icon={Square} onClick={()=>setStatus('Stopped')}>Stop</Button><Button variant="danger" icon={CircleStop} onClick={()=>setStatus('Killed')}>Kill</Button></div><div className="autonomy-row"><label><span>Autonomy level</span><input type="range" min="0" max="4" value={a?.autonomy||0} onChange={e=>s.setAgentAutonomy(a.id,Number(e.target.value))}/></label><strong>Level {a?.autonomy}</strong><span>{['Assistive only','Recommend','Act with approval','Act within bounded policy','High autonomy'][a?.autonomy||0]}</span></div></Card>
        <div className="grid two"><Card><h3>Autonomy envelope</h3><div className="stack-list">{envelope.map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div></Card><Card><h3>Current execution trace</h3><div className="trace">{['Goal accepted','Context loaded','Plan generated','Knowledge retrieved','Tool permission checked','Risk check','Human approval','Action execution','Self-check','Evaluate'].map((x,i)=><div key={x} className={i<6?'done':i===6?'current':''}><span>{i<6?<Check size={13}/>:i===6?<Activity size={13}/>:i+1}</span><strong>{x}</strong><em>{i<6?'complete':i===6?'awaiting approval':'queued'}</em></div>)}</div></Card></div>
      </div>
    </div>
  </>;
}

function Governance() {
  const s=useStudioStore();
  const frameworks=[
    ['EU AI Act','Risk classification, provider/deployer duties, transparency, human oversight'],['NIST AI RMF','Govern, Map, Measure, Manage'],['ISO/IEC 42001','AI management system, policy, risk, lifecycle and evidence'],['AIGP aligned','Governance practice across law, risk, data, operations and accountability'],['NCSC CAF 4.0','Cyber governance, protection, detection, response and recovery'],['ISO/IEC 27001','ISMS, risk treatment and security controls']
  ];
  const policies=[
    ['Production AI must use certified data products',s.dataProducts.every(dp=>dp.trust>=80)],['Critical data elements require an owner',s.cdes.every(c=>c.owner)],['Data quality must meet defined threshold',s.qualityRules.every(q=>q.status==='Pass')],['Unapproved MCP servers cannot connect',s.mcpServers.every(m=>['Approved','Restricted'].includes(m.status))],['High-risk actions require human approval',s.agents.filter(a=>a.risk==='High').every(a=>a.approval.toLowerCase().includes('approval'))],['Models cannot deploy without required eval score',s.evals.every(e=>e.status==='Pass')]
  ];
  const security=['Identity and RBAC','Secrets and encryption','Private connectivity','Data exfiltration','Prompt injection','Indirect injection','Jailbreak','Data poisoning','Vector poisoning','Memory poisoning','Tool abuse','MCP attacks','Agent privilege escalation','Credential theft','Unsafe code','Supply chain'];
  return <>
    <SectionTitle eyebrow="Governance, policy and security" title="One assurance layer across data, AI, agents and operations" copy="Framework mappings stay tied to enforceable controls, evidence and release decisions rather than being a separate compliance catalogue."/>
    <div className="grid three">{frameworks.map(([name,copy])=><Card key={name}><div className="framework-card"><ShieldCheck size={21}/><div><strong>{name}</strong><span>{copy}</span></div></div></Card>)}</div>
    <div className="grid two">
      <Card><div className="card-head"><div><h3>Policy-as-code status</h3><p>Executable guardrails generated from governance policy.</p></div></div><div className="policy-list">{policies.map(([p,ok])=><div key={p}><span className={ok?'policy-status pass':'policy-status fail'}>{ok?<Check/>:<X/>}</span><strong>{p}</strong><Badge tone={ok?'good':'bad'}>{ok?'Enforced':'Violation'}</Badge></div>)}</div></Card>
      <Card><div className="card-head"><div><h3>AI and agent security threat surface</h3><p>Security controls cover model, RAG, MCP, agent and software supply chain risks.</p></div></div><div className="security-grid">{security.map((x,i)=><div key={x} className={i%5===0?'attention':''}><ShieldCheck size={14}/><span>{x}</span></div>)}</div></Card>
    </div>
    <Card><div className="card-head"><div><h3>Architecture decisions and approvals</h3><p>Evidence-linked decisions become part of the enterprise audit graph.</p></div><Button variant="secondary" icon={Plus} onClick={()=>{const title=prompt('Decision title');if(title){s.addDecision({title,owner:'Architecture Council'});s.addNotification('Architecture decision recorded.','success')}}}>Add decision</Button></div><div className="table-wrap"><table><thead><tr><th>Decision</th><th>Owner</th><th>Status</th><th>Date</th></tr></thead><tbody>{s.decisions.map(d=><tr key={d.id}><td><strong>{d.title}</strong><span className="muted-cell">{d.id}</span></td><td>{d.owner}</td><td><Badge tone={d.status==='Approved'?'good':'warn'}>{d.status}</Badge></td><td>{d.date}</td></tr>)}</tbody></table></div></Card>
  </>;
}

function FinOpsValue() {
  const s=useStudioStore();
  const totalCost=s.useCases.reduce((a,u)=>a+u.cost,0);
  const totalValue=s.useCases.reduce((a,u)=>a+u.value,0);
  const realized=Math.round(totalValue*0.31);
  const data=s.useCases.map(u=>({name:u.name.split(' ').slice(0,3).join(' '),cost:Math.round(u.cost/1000),value:Math.round(u.value/1000)}));
  const trend=[{m:'Apr',cost:210,value:380},{m:'May',cost:260,value:610},{m:'Jun',cost:310,value:900},{m:'Jul',cost:365,value:1230},{m:'Aug',cost:420,value:1680}];
  return <>
    <SectionTitle eyebrow="FinOps + ValueOps" title="Tie every AI pound to a measurable business outcome" copy="Track cost per use case and compare projected value with realised value before deciding to scale, optimise or retire."/>
    <div className="kpi-grid four"><KPI label="Portfolio cost" value={fmtMoney(totalCost)} detail="Projected delivery + run cost" icon={CircleDollarSign} tone="blue"/><KPI label="Target value" value={fmtMoney(totalValue)} detail="Business-case target" icon={Target} tone="green"/><KPI label="Realised value" value={fmtMoney(realized)} detail={`${Math.round(100*realized/totalValue)}% of target`} icon={TrendingUp} tone="teal"/><KPI label="Portfolio ROI" value={`${(totalValue/Math.max(totalCost,1)).toFixed(1)}×`} detail="Target value / cost" icon={Gauge} tone="purple"/></div>
    <div className="grid two"><Card><h3>Cost vs target value by use case</h3><div className="chart-lg"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip formatter={(v)=>`${v}k`}/><Bar dataKey="cost" radius={[5,5,0,0]}/><Bar dataKey="value" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></Card><Card><h3>Value realisation trend</h3><div className="chart-lg"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="m"/><YAxis/><Tooltip/><Area dataKey="value" fillOpacity={0.14}/><Line dataKey="cost"/></AreaChart></ResponsiveContainer></div></Card></div>
    <Card><div className="card-head"><div><h3>ValueOps decisions</h3><p>Business case → target value → delivery → actual value → variance → optimise → scale or retire.</p></div></div><div className="table-wrap"><table><thead><tr><th>Use case</th><th>Cost</th><th>Target value</th><th>Readiness-adjusted value</th><th>ROI</th><th>Recommendation</th></tr></thead><tbody>{s.useCases.map(u=>{const adjusted=u.value*u.readiness/100;const roi=adjusted/Math.max(1,u.cost);return <tr key={u.id}><td><strong>{u.name}</strong></td><td>{fmtMoney(u.cost)}</td><td>{fmtMoney(u.value)}</td><td>{fmtMoney(adjusted)}</td><td>{roi.toFixed(1)}×</td><td><Badge tone={roi>=4?'good':roi>=2?'warn':'bad'}>{roi>=4?'Scale':roi>=2?'Optimise':'Reassess'}</Badge></td></tr>})}</tbody></table></div></Card>
  </>;
}

function Roadmap() {
  const s=useStudioStore();
  const guidance={
    'Strategy':['Define target outcomes and investment guardrails','CDO / CAIO','Board-approved strategy and KPI baseline'],
    'Governance Foundation':['Establish councils, ownership, policy-as-code and evidence model','Governance Lead','Approved AI and data governance operating model'],
    'Data Foundations':['Prioritise domains, CDEs, quality, lineage and source-of-truth decisions','Data Transformation Lead','Trusted data score above release threshold'],
    'Evals':['Create golden, safety, regression and human evaluation suites before release','AI Evaluation Lead','All mandatory quality gates pass'],
    'Agentic AI':['Introduce MCP trust, autonomy envelopes and human approval controls','AI Architect','Bounded agents pass safety and operational tests'],
    'Autonomous Operations':['Use policy-bound remediation and AI lifecycle operations','SRE / AIOps Lead','Self-healing verified within error and cost budgets']
  };
  return <>
    <SectionTitle eyebrow="Implementation roadmap" title="From strategy to enterprise-scale autonomous operations" copy="Each phase combines people, process, technology, data, governance, security, cost, dependencies, exit criteria and KPIs."/>
    <div className="roadmap-vertical">{s.roadmap.map((r,i)=>{const g=guidance[r.name]||['Deliver the phase outcomes and resolve dependencies','Programme Lead','Phase exit criteria accepted'];return <div key={r.phase} className="roadmap-row"><div className="roadmap-marker"><span>{r.phase}</span><i/></div><Card><div className="roadmap-head"><div><div className="eyebrow">Phase {r.phase}</div><h3>{r.name}</h3></div><Badge tone={scoreTone(r.progress)}>{r.progress}%</Badge></div><Progress value={r.progress} tone={r.progress>=70?'green':r.progress>=35?'amber':'purple'}/><div className="roadmap-guidance"><div><span>What to do</span><strong>{g[0]}</strong></div><div><span>Owner</span><strong>{g[1]}</strong></div><div><span>Exit evidence</span><strong>{g[2]}</strong></div></div></Card></div>})}</div>
  </>;
}

function Artifacts() {
  const s=useStudioStore();
  const artifacts=[
    ['Enterprise Data Strategy','Strategy, principles, priority domains, operating model and KPIs'],['AI Product Strategy','Use-case portfolio, model strategy, adoption, governance and roadmap'],['Data Governance Framework','Policies, decision rights, ownership, controls and evidence'],['Data Quality Framework','CDEs, rules, thresholds, incidents and remediation'],['Target Architecture','Data, AI, RAG, MCP, agents, serving, operations and controls'],['AI Evaluation Report','Evaluation datasets, metrics, results, thresholds and release decision'],['AI Bill of Materials','Models, prompts, agents, MCP, tools, vector stores, libraries and providers'],['Data Bill of Materials','Sources, tables, transformations, master/reference data, CDEs and consumers'],['Risk Register','Data, AI, model, agent, MCP, operational and business risks'],['Implementation Roadmap','Phases, dependencies, exit criteria, owners and KPIs'],['RACI','Executive sponsor through data owner, steward, custodian and approval authorities'],['Board Pack','Maturity, risk, cost, value, blockers and decisions required']
  ];
  const download=(name)=>{
    const payload={title:name,generatedAt:new Date().toISOString(),organisation:s.organisation,objectives:s.objectives,departments:s.departments,domains:s.domains,cdes:s.cdes,qualityRules:s.qualityRules,dataProducts:s.dataProducts,useCases:s.useCases,models:s.models,rag:s.rag,mcpServers:s.mcpServers,agents:s.agents,evals:s.evals,incidents:s.incidents,decisions:s.decisions,roadmap:s.roadmap};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.json`;a.click();URL.revokeObjectURL(url);s.addNotification(`${name} exported.`, 'success');
  };
  const exportAll=()=>{const blob=new Blob([s.exportState()],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='enterprise-data-ai-os-workspace.json';a.click();URL.revokeObjectURL(url)};
  const importAll=(file)=>{const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);const allowed=['organisation','objectives','departments','domains','cdes','qualityRules','dataProducts','useCases','models','rag','mcpServers','agents','evals','incidents','decisions','roadmap'];const patch={};allowed.forEach(k=>{if(parsed[k])patch[k]=parsed[k]});useStudioStore.setState(patch);s.addNotification('Workspace imported and reopened.','success')}catch{s.addNotification('Import failed. Select a valid workspace JSON file.','error')}};reader.readAsText(file)};
  return <>
    <SectionTitle eyebrow="Artifact factory" title="Generate evidence packs from the connected digital thread" copy="Exports use live workspace state so the same data, owners, models, controls and decisions remain consistent across every artefact." action={<div className="button-row"><label className="btn secondary file-btn"><Upload size={16}/><span>Import workspace</span><input type="file" accept="application/json" onChange={e=>e.target.files?.[0]&&importAll(e.target.files[0])}/></label><Button icon={Download} onClick={exportAll}>Export workspace</Button></div>}/>
    <div className="artifact-grid">{artifacts.map(([name,copy])=><Card key={name} className="artifact-card"><div className="artifact-icon"><FileText size={20}/></div><div><strong>{name}</strong><p>{copy}</p></div><Button variant="secondary" icon={Download} onClick={()=>download(name)}>Preview export</Button></Card>)}</div>
    <Card><div className="card-head"><div><h3>Workspace persistence</h3><p>The current project is stored in browser local storage. Export a JSON snapshot to move it between browsers or environments.</p></div><Button variant="danger" icon={RefreshCw} onClick={()=>{if(confirm('Reset the workspace to the seeded enterprise demo?'))s.resetDemo()}}>Reset demo</Button></div></Card>
  </>;
}

function Placeholder({ name }) { return <Card><Empty title={name} copy="This workspace is routed through the connected operating model and will inherit the same persistent enterprise state."/></Card>; }

function App() {
  const active=useStudioStore(s=>s.activePage);
  let page;
  switch(active){
    case 'Executive Home': page=<ExecutiveHome/>; break;
    case 'Digital Thread': page=<DigitalThread/>; break;
    case 'Strategy Intake': page=<StrategyIntake/>; break;
    case 'Data Foundations': page=<DataFoundations/>; break;
    case 'Use Case Studio': page=<UseCaseStudio/>; break;
    case 'AI Engineering': page=<AIEngineering/>; break;
    case 'Eval Studio': page=<EvalStudio/>; break;
    case 'Architecture': page=<Architecture/>; break;
    case 'Agent Operations': page=<AgentOperations/>; break;
    case 'Governance': page=<Governance/>; break;
    case 'FinOps & Value': page=<FinOpsValue/>; break;
    case 'Roadmap': page=<Roadmap/>; break;
    case 'Artifacts': page=<Artifacts/>; break;
    default: page=<Placeholder name={active}/>;
  }
  return <AppShell>{page}</AppShell>;
}

export default App;
