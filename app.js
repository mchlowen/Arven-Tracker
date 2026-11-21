const DB_NAME="arven_tracker_db", DB_VERSION=1;
let db, toastTimer;
const $=id=>document.getElementById(id);
const rupiah=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));
const today=()=>new Date().toISOString().slice(0,10);
function notify(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2400)}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains("transactions"))d.createObjectStore("transactions",{keyPath:"id"});if(!d.objectStoreNames.contains("budgets"))d.createObjectStore("budgets",{keyPath:"id"});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function store(name,mode="readonly"){return db.transaction(name,mode).objectStore(name)}
function all(name){return new Promise((resolve,reject)=>{const r=store(name).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function put(name,obj){return new Promise((resolve,reject)=>{const r=store(name,"readwrite").put(obj);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}
function del(name,id){return new Promise((resolve,reject)=>{const r=store(name,"readwrite").delete(id);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}
function monthKey(d){return d.slice(0,7)}
async function render(){
 const txs=await all("transactions"), budgets=await all("budgets"), month=monthKey(today());
 const current=txs.filter(t=>monthKey(t.date)===month);
 const income=current.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
 const expense=current.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
 $("monthLabel").textContent=new Date().toLocaleDateString("id-ID",{month:"long",year:"numeric"}).toUpperCase();
 $("balanceValue").textContent=rupiah(income-expense);$("incomeValue").textContent=rupiah(income);$("expenseValue").textContent=rupiah(expense);
 $("transactionCount").textContent=current.length;$("savingsValue").textContent=rupiah(Math.max(0,income-expense));
 const cats={};current.filter(t=>t.type==="expense").forEach(t=>cats[t.category]=(cats[t.category]||0)+t.amount);
 const entries=Object.entries(cats).sort((a,b)=>b[1]-a[1]);
 $("categoryBreakdown").innerHTML=entries.length?entries.map(([c,v])=>`<div class="break-row"><div class="break-left"><i class="dot"></i><span class="tx-title">${esc(c)}</span></div><strong class="tx-amount">${rupiah(v)}</strong></div>`).join(""):'<p class="muted small">Belum ada pengeluaran bulan ini.</p>';
 $("recentTransactions").innerHTML=txs.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt).slice(0,5).map(txHTML).join("")||'<p class="muted small">Belum ada transaksi. Mulai dengan menambahkan transaksi pertamamu.</p>';
 const months=[...new Set(txs.map(t=>monthKey(t.date)))].sort().reverse();if(!months.includes(month))months.unshift(month);
 $("monthFilter").innerHTML=months.map(m=>`<option value="${m}">${new Date(m+"-01").toLocaleDateString("id-ID",{month:"long",year:"numeric"})}</option>`).join("");
 renderTransactions();renderBudgets(budgets,cats);
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function txHTML(t){return `<div class="tx-row"><div class="tx-left"><i class="dot"></i><div><div class="tx-title">${esc(t.description)}</div><div class="tx-meta">${esc(t.category)} · ${new Date(t.date+"T12:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}</div></div></div><div style="text-align:right"><div class="tx-amount ${t.type}">${t.type==="income"?"+":"−"} ${rupiah(t.amount)}</div><button class="text-btn delete-tx" data-id="${t.id}">Hapus</button></div></div>`}
async function renderTransactions(){const month=$("monthFilter").value||monthKey(today()),type=$("typeFilter").value,txs=(await all("transactions")).filter(t=>monthKey(t.date)===month&&(type==="all"||t.type===type)).sort((a,b)=>b.date.localeCompare(a.date));$("allTransactions").innerHTML=txs.map(txHTML).join("")||'<p class="muted small">Tidak ada transaksi pada periode ini.</p>'}
function renderBudgets(budgets,cats={}){const total=budgets.reduce((s,b)=>s+b.amount,0);$("budgetTotal").textContent=rupiah(total);$("budgetList").innerHTML=budgets.map(b=>{const spent=cats[b.name]||0,pct=Math.min(100,spent/b.amount*100);return `<div class="budget-row"><div class="budget-row-top"><strong>${esc(b.name)}</strong><span>${rupiah(spent)} / ${rupiah(b.amount)}</span></div><div class="progress"><span style="width:${pct}%"></span></div><button class="text-btn delete-budget" data-id="${b.id}">Hapus anggaran</button></div>`}).join("")||'<p class="muted small">Belum ada anggaran.</p>'}
function switchView(view){document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$(view+"View").classList.remove("hidden");document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===view));}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.goto)));
$("addTransactionBtn").onclick=()=>$("transactionDialog").showModal();$("closeDialog").onclick=$("cancelDialog").onclick=()=>$("transactionDialog").close();
$("txDate").value=today();
$("transactionForm").onsubmit=async e=>{e.preventDefault();const amount=Number($("txAmount").value);if(!Number.isFinite(amount)||amount<=0)return notify("Nominal tidak valid.");await put("transactions",{id:crypto.randomUUID(),type:$("txType").value,description:$("txDescription").value.trim(),category:$("txCategory").value,amount,date:$("txDate").value,createdAt:Date.now()});$("transactionDialog").close();e.target.reset();$("txDate").value=today();await render();notify("Transaksi tersimpan di perangkat.")};
$("monthFilter").onchange=renderTransactions;$("typeFilter").onchange=renderTransactions;
document.addEventListener("click",async e=>{const b=e.target.closest(".delete-tx");if(b&&confirm("Hapus transaksi ini?")){await del("transactions",b.dataset.id);await render();notify("Transaksi dihapus.")}const bb=e.target.closest(".delete-budget");if(bb&&confirm("Hapus anggaran ini?")){await del("budgets",bb.dataset.id);await render();notify("Anggaran dihapus.")}});
$("budgetForm").onsubmit=async e=>{e.preventDefault();await put("budgets",{id:crypto.randomUUID(),name:$("budgetName").value.trim(),amount:Number($("budgetAmount").value)});e.target.reset();await render();notify("Anggaran tersimpan.")};
$("exportBtn").onclick=async()=>{const payload={app:"ARVEN TRACKER",version:1,exportedAt:new Date().toISOString(),transactions:await all("transactions"),budgets:await all("budgets")};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`ARVEN_BACKUP_${today()}.json`;a.click();URL.revokeObjectURL(a.href);notify("Backup berhasil dibuat.")};
$("importInput").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(data.app!=="ARVEN TRACKER"||!Array.isArray(data.transactions)||!Array.isArray(data.budgets))throw Error("Format backup tidak sesuai");if(!confirm("Impor akan mengganti seluruh transaksi dan anggaran saat ini. Lanjutkan?"))return;for(const t of await all("transactions"))await del("transactions",t.id);for(const b of await all("budgets"))await del("budgets",b.id);for(const t of data.transactions)await put("transactions",t);for(const b of data.budgets)await put("budgets",b);await render();notify("Backup berhasil dipulihkan.")}catch(err){notify("File backup tidak valid.")}e.target.value=""};
$("clearBtn").onclick=async()=>{if(!confirm("Hapus seluruh transaksi dan anggaran? Pastikan sudah membuat backup."))return;for(const t of await all("transactions"))await del("transactions",t.id);for(const b of await all("budgets"))await del("budgets",b.id);await render();notify("Data aplikasi dihapus.")};

// PIN gate: hash is salted and stored locally. This is an access gate, not a substitute for iOS device security.
const PIN_KEY="arven_pin_record";
async function hashPin(pin,salt){const bytes=new TextEncoder().encode(salt+":"+pin);const digest=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function randomSalt(){const a=new Uint8Array(16);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function lockIfConfigured(){const rec=localStorage.getItem(PIN_KEY);if(rec){$("lockScreen").classList.remove("hidden");$("pinInput").focus()}}
$("unlockBtn").onclick=async()=>{const rec=JSON.parse(localStorage.getItem(PIN_KEY)||"null"),pin=$("pinInput").value;if(!rec){$("lockScreen").classList.add("hidden");return}const h=await hashPin(pin,rec.salt);if(h===rec.hash){$("lockScreen").classList.add("hidden");$("pinInput").value="";$("pinError").textContent=""}else{$("pinError").textContent="PIN tidak sesuai."; $("pinInput").value=""}};
$("pinInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("unlockBtn").click()});
$("lockBtn").onclick=()=>{if(localStorage.getItem(PIN_KEY)){$("pinInput").value="";$("lockScreen").classList.remove("hidden")}else notify("Atur PIN terlebih dahulu di Settings.")};
$("setPinBtn").onclick=()=>$("pinDialog").showModal();$("closePinDialog").onclick=$("cancelPinDialog").onclick=()=>$("pinDialog").close();
$("pinForm").onsubmit=async e=>{e.preventDefault();const p=$("newPin").value,c=$("confirmPin").value;if(!/^\d{6}$/.test(p))return notify("PIN harus terdiri dari 6 angka.");if(p!==c)return notify("Konfirmasi PIN tidak sama.");const salt=randomSalt();localStorage.setItem(PIN_KEY,JSON.stringify({salt,hash:await hashPin(p,salt)}));$("pinDialog").close();e.target.reset();notify("PIN berhasil diatur.")};
(async()=>{try{db=await openDB();await render();await lockIfConfigured();if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});}catch(e){notify("Database lokal tidak dapat dibuka di mode file. Buka melalui HTTPS terlebih dahulu.")}})();
