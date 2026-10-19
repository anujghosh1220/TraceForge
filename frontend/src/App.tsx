import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";
async function api(path: string, opts?: RequestInit) {
  const r = await fetch(`${API}${path}`, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json();
}
const tabs = ["overview","projects","datasets","runs","traces","compare"] as const;
type Tab = typeof tabs[number];
export default function App() {
  const [tab, setTab] = useState<Tab>("overview");
  const [projects, setProjects] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [datasets, setDatasets] = useState<any[]>([]);
  const [datasetName, setDatasetName] = useState("");
  const [cases, setCases] = useState<any[]>([]);
  const [caseInput, setCaseInput] = useState('{"text":"hello"}');
  const [caseExpected, setCaseExpected] = useState('{"text":"Paris"}');
  const [runs, setRuns] = useState<any[]>([]);
  const [runProfile, setRunProfile] = useState("correct");
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [traces, setTraces] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [baseRun, setBaseRun] = useState("");
  const [candRun, setCandRun] = useState("");
  const [error, setError] = useState("");

  const loadProjects = async () => { try { setProjects(await api("/api/projects")); } catch(e:any){setError(e.message);} };
  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (selectedProject) { api(`/api/projects/${selectedProject}/datasets`).then(setDatasets).catch(e=>setError(e.message)); api(`/api/projects/${selectedProject}/runs`).then(setRuns).catch(()=>{}); api(`/api/projects/${selectedProject}/traces`).then(setTraces).catch(()=>{}); } }, [selectedProject]);

  const createProject = async () => { if(!name) return; await api("/api/projects",{method:"POST",body:JSON.stringify({name})}); setName(""); loadProjects(); };
  const deleteProject = async (id:string) => { await api(`/api/projects/${id}`,{method:"DELETE"}); loadProjects(); };
  const createDataset = async () => { if(!datasetName||!selectedProject) return; await api(`/api/projects/${selectedProject}/datasets`,{method:"POST",body:JSON.stringify({name:datasetName})}); setDatasetName(""); setDatasets(await api(`/api/projects/${selectedProject}/datasets`)); };
  const loadCases = async (dsId:string) => { setCases(await api(`/api/datasets/${dsId}/cases`)); };
  const addCase = async (dsId:string) => {
    let inp,exp; try { inp=JSON.parse(caseInput); exp=JSON.parse(caseExpected); } catch { setError("invalid json"); return; }
    await api(`/api/datasets/${dsId}/cases`,{method:"POST",body:JSON.stringify({input:inp,expected:exp,criteria:{exact_match:true,non_empty:true}})});
    loadCases(dsId);
  };
  const startRun = async (dsId:string) => {
    const run = await api(`/api/projects/${selectedProject}/runs`,{method:"POST",body:JSON.stringify({dataset_id:dsId,profile:runProfile})});
    setSelectedRun(run); setResults(await api(`/api/runs/${run.id}/results`));
    setRuns(await api(`/api/projects/${selectedProject}/runs`));
  };
  const viewRun = async (id:string) => { setSelectedRun(await api(`/api/runs/${id}`)); setResults(await api(`/api/runs/${id}/results`)); };
  const doCompare = async () => {
    const c = await api(`/api/projects/${selectedProject}/comparisons`,{method:"POST",body:JSON.stringify({base_run_id:baseRun,candidate_run_id:candRun})});
    setComparison(c);
  };

  const latestPass = runs.length? (runs[0].metrics?.pass_rate||0) : 0;
  const totalRuns = runs.length;
  const failedRuns = runs.filter(r=> (r.metrics?.failed||0)>0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-56 border-r border-slate-800 p-4 hidden md:block">
        <div className="text-violet-400 font-bold text-lg mb-6">TraceForge</div>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`block w-full text-left px-3 py-2 rounded mb-1 capitalize ${tab===t?"bg-violet-600/20 text-violet-300":"text-slate-400 hover:bg-slate-800"}`}>{t}</button>
        ))}
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 p-4 flex items-center gap-3">
          <span className="md:hidden text-violet-400 font-bold">TraceForge</span>
          <span className="text-slate-400 text-sm capitalize">{tab}</span>
          <select value={selectedProject} onChange={e=>setSelectedProject(e.target.value)} className="ml-auto bg-slate-800 px-2 py-1 rounded text-sm">
            <option value="">Select project</option>
            {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </header>
        {error && <div className="bg-red-900/40 text-red-300 p-2 text-sm">{error} <button onClick={()=>setError("")} className="ml-2 underline">dismiss</button></div>}
        <main className="p-6 max-w-6xl mx-auto w-full">
          {tab==="overview" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900 border border-slate-800 rounded p-4"><div className="text-slate-500 text-xs">Projects</div><div className="text-2xl font-bold">{projects.length}</div></div>
                <div className="bg-slate-900 border border-slate-800 rounded p-4"><div className="text-slate-500 text-xs">Runs</div><div className="text-2xl font-bold">{totalRuns}</div></div>
                <div className="bg-slate-900 border border-slate-800 rounded p-4"><div className="text-slate-500 text-xs">Latest pass rate</div><div className="text-2xl font-bold">{(latestPass*100).toFixed(0)}%</div></div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-4">
                <div className="text-sm font-semibold mb-2">Recent runs</div>
                {runs.slice(0,5).map(r=>(
                  <div key={r.id} className="flex justify-between text-sm border-t border-slate-800 py-2">
                    <span className="font-mono text-xs">{r.id.slice(0,8)}</span>
                    <span className="text-slate-400">{r.profile}</span>
                    <span className={r.status==="completed"?"text-green-400":"text-yellow-400"}>{r.status}</span>
                  </div>
                ))}
                {runs.length===0 && <div className="text-slate-500 text-sm">No runs yet.</div>}
              </div>
              <div className="mt-4 text-sm text-slate-500">Failed runs with failures: {failedRuns}</div>
            </div>
          )}
          {tab==="projects" && (
            <div>
              <div className="flex gap-2 mb-4">
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="New project name" className="bg-slate-800 px-3 py-2 rounded flex-1"/>
                <button onClick={createProject} className="bg-violet-600 px-4 py-2 rounded">Create</button>
              </div>
              <div className="space-y-2">
                {projects.map(p=>(
                  <div key={p.id} className="border border-slate-800 p-3 rounded flex justify-between items-center">
                    <div><div className="font-semibold">{p.name}</div><div className="text-xs text-slate-500 font-mono">{p.id}</div></div>
                    <button onClick={()=>deleteProject(p.id)} className="text-red-400 text-sm">Delete</button>
                  </div>
                ))}
                {projects.length===0 && <div className="text-slate-500">No projects yet.</div>}
              </div>
            </div>
          )}
          {tab==="datasets" && (
            <div>
              {!selectedProject && <div className="text-slate-500">Select a project first.</div>}
              {selectedProject && (
                <>
                  <div className="flex gap-2 mb-4">
                    <input value={datasetName} onChange={e=>setDatasetName(e.target.value)} placeholder="Dataset name" className="bg-slate-800 px-3 py-2 rounded flex-1"/>
                    <button onClick={createDataset} className="bg-violet-600 px-4 py-2 rounded">Create Dataset</button>
                  </div>
                  <div className="grid gap-4">
                    {datasets.map(ds=>(
                      <div key={ds.id} className="border border-slate-800 p-4 rounded">
                        <div className="font-semibold mb-2">{ds.name}</div>
                        <div className="flex gap-2 mb-3">
                          <button onClick={()=>loadCases(ds.id)} className="text-xs bg-slate-700 px-2 py-1 rounded">Load cases</button>
                          <button onClick={()=>startRun(ds.id)} className="text-xs bg-green-700 px-2 py-1 rounded">Run ({runProfile})</button>
                          <select value={runProfile} onChange={e=>setRunProfile(e.target.value)} className="bg-slate-800 text-xs px-1 py-1 rounded">
                            {["correct","incorrect","invalid_json","empty","error"].map(p=><option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1 mb-3">
                          {cases.map(c=>(
                            <div key={c.id} className="text-xs text-slate-400 border-t border-slate-800 pt-1 font-mono">in: {JSON.stringify(c.input)} → exp: {JSON.stringify(c.expected)}</div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input value={caseInput} onChange={e=>setCaseInput(e.target.value)} className="bg-slate-800 px-2 py-1 rounded text-xs flex-1 font-mono"/>
                          <input value={caseExpected} onChange={e=>setCaseExpected(e.target.value)} className="bg-slate-800 px-2 py-1 rounded text-xs flex-1 font-mono"/>
                          <button onClick={()=>addCase(ds.id)} className="bg-slate-700 px-2 py-1 rounded text-xs">Add case</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {tab==="runs" && (
            <div>
              <h2 className="font-semibold mb-3">Runs</h2>
              <div className="space-y-2 mb-4">
                {runs.map(r=>(
                  <div key={r.id} className="border border-slate-800 p-3 rounded flex justify-between items-center">
                    <div><span className="font-mono text-xs">{r.id.slice(0,8)}</span> <span className="text-slate-400 text-xs">{r.profile}</span> <span className={r.status==="completed"?"text-green-400":"text-yellow-400"}>{r.status}</span> <span className="text-xs">pass {((r.metrics?.pass_rate||0)*100).toFixed(0)}%</span></div>
                    <button onClick={()=>viewRun(r.id)} className="text-xs bg-slate-700 px-2 py-1 rounded">View</button>
                  </div>
                ))}
              </div>
              {selectedRun && (
                <div className="border border-slate-700 p-4 rounded">
                  <div className="font-semibold mb-2">Run {selectedRun.id.slice(0,8)} — {selectedRun.status}</div>
                  <div className="text-sm text-slate-400 mb-2 font-mono">{JSON.stringify(selectedRun.metrics)}</div>
                  <table className="w-full text-xs">
                    <thead><tr className="text-slate-500"><th className="text-left">status</th><th>actual</th><th>expected</th><th>latency</th><th>error</th></tr></thead>
                    <tbody>
                      {results.map(r=>(
                        <tr key={r.id} className="border-t border-slate-800">
                          <td className={r.passed?"text-green-400":"text-red-400"}>{r.passed?"PASS":"FAIL"}</td>
                          <td className="font-mono">{JSON.stringify(r.actual)}</td>
                          <td className="font-mono">{JSON.stringify(r.expected)}</td>
                          <td>{r.latency_ms}ms</td>
                          <td className="text-red-300">{r.error||""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {tab==="traces" && (
            <div className="space-y-2">
              {traces.map(t=>(
                <div key={t.id} className="border border-slate-800 p-3 rounded text-sm">
                  <div className="font-semibold">{t.operation} <span className={t.status==="ok"?"text-green-400":"text-red-400"}>{t.status}</span></div>
                  <div className="text-xs text-slate-500 font-mono">{t.id} · {t.duration_ms}ms</div>
                  <div className="text-xs text-slate-400 font-mono">in: {JSON.stringify(t.input_meta)} out: {JSON.stringify(t.output_meta)}</div>
                  {t.error && <div className="text-xs text-red-300">{t.error}</div>}
                </div>
              ))}
              {traces.length===0 && <div className="text-slate-500">No traces.</div>}
            </div>
          )}
          {tab==="compare" && (
            <div>
              <div className="flex gap-2 mb-4">
                <select value={baseRun} onChange={e=>setBaseRun(e.target.value)} className="bg-slate-800 px-2 py-1 rounded">
                  <option value="">Base run</option>
                  {runs.map(r=><option key={r.id} value={r.id}>{r.id.slice(0,8)} {r.profile}</option>)}
                </select>
                <select value={candRun} onChange={e=>setCandRun(e.target.value)} className="bg-slate-800 px-2 py-1 rounded">
                  <option value="">Candidate run</option>
                  {runs.map(r=><option key={r.id} value={r.id}>{r.id.slice(0,8)} {r.profile}</option>)}
                </select>
                <button onClick={doCompare} className="bg-violet-600 px-3 py-1 rounded">Compare</button>
              </div>
              {comparison && (
                <div className="border border-slate-700 p-4 rounded">
                  <div className="text-sm mb-2">pass_rate_delta: {(comparison.result.pass_rate_delta*100).toFixed(1)}%</div>
                  <div className="text-sm text-red-300">regressions: {comparison.result.regressions.length}</div>
                  <div className="text-sm text-green-300">improvements: {comparison.result.improvements.length}</div>
                  <pre className="text-xs mt-2 bg-slate-900 p-2 rounded overflow-auto">{JSON.stringify(comparison.result.changed_cases,null,2)}</pre>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
