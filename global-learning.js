/* Vidya Nirman learning tracker v2. Local-first; optional, student-enabled Supabase sync. */
(() => {
 'use strict';
 const page=location.pathname.split('/').pop()||'index.html';
 const title=document.title||page;
 const localKey='vn-learning-v1';
 const syncKey='vn-learning-cloud-sync-v1';
 let activeLocalKey=localKey, activeUserId=null;
 const now=()=>new Date().toISOString();
 const empty=()=>({visits:[],quiz:[],ai:[],notes:[]});
 const readLocal=()=>{try{return {...empty(),...JSON.parse(localStorage.getItem(activeLocalKey)||'{}')}}catch{return empty()}};
 const saveLocal=d=>{try{localStorage.setItem(activeLocalKey,JSON.stringify(d))}catch{}};
 const activateUserScope=userId=>{if(activeUserId===userId)return;const userKey='vn-learning-v1-user-'+userId;let scoped={...empty()};try{scoped={...empty(),...JSON.parse(localStorage.getItem(userKey)||'{}')}}catch{};activeLocalKey=userKey;activeUserId=userId;saveLocal(scoped);data=scoped;};
 let data=readLocal(), client=null, currentUser=null, syncing=false, syncReady=false;
 const syncEnabled=()=>localStorage.getItem(syncKey)==='yes';
 const notify=()=>window.dispatchEvent(new CustomEvent('vn-learning-updated'));
 const makeId=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
 const add=(kind,item)=>{
  data=readLocal(); data[kind]=Array.isArray(data[kind])?data[kind]:[];
  if(!item.id)item.id=makeId(); data[kind].unshift(item); data[kind]=data[kind].slice(0,250); saveLocal(data); notify();
  if(kind!=='ai'&&syncEnabled()&&currentUser) pushItems(kind,[item]).catch(()=>setStatus('Cloud sync paused. Your activity is still saved on this device.'));
 };
 const isQuest=/quest/i.test(page);
 add('visits',{page,title,at:now()});
 // Capture compatible AI exchanges locally. AI text is NOT uploaded to cloud sync.
 if(window.fetch){const originalFetch=window.fetch.bind(window);window.fetch=async(...args)=>{const res=await originalFetch(...args);try{const req=args[0],url=typeof req==='string'?req:(req&&req.url)||'';if(/\/api\/chat(?:\?|$)/.test(url)&&args[1]?.body){const body=JSON.parse(args[1].body),copy=res.clone();copy.json().then(result=>{const history=Array.isArray(body.messages)?body.messages:[];const question=body.message||body.prompt||body.question||body.text||[...history].reverse().find(x=>x&&x.role==='user')?.content||'';const answer=result.reply||result.response||result.answer||result.message||result.content||'';if(question||answer)add('ai',{page,at:now(),question:String(question).slice(0,3000),answer:typeof answer==='string'?answer.slice(0,5000):JSON.stringify(answer).slice(0,5000)})}).catch(()=>{})}}catch{}return res}};
 if(isQuest)document.addEventListener('click',e=>{const b=e.target?.closest?.('button');if(!b)return;const label=(b.innerText||b.getAttribute('aria-label')||b.title||'Quiz interaction').trim().slice(0,180);if(label&&!/sign in|sign out|dashboard/i.test(label))add('quiz',{page,title,at:now(),action:label})},true);
 let status='Local-only mode';
 function setStatus(message){status=message;window.dispatchEvent(new CustomEvent('vn-cloud-sync-status',{detail:{status}}))}
 async function loadSupabase(){if(window.supabase?.createClient)return true;return new Promise(resolve=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=()=>resolve(!!window.supabase?.createClient);s.onerror=()=>resolve(false);document.head.appendChild(s)})}
 async function getClient(){if(client)return client;const url=window.VN_SUPABASE_URL,key=window.VN_SUPABASE_ANON_KEY;if(!url?.startsWith('https://')||!key||/PASTE_YOUR_|YOUR-PROJECT/i.test(key))throw new Error('Supabase browser configuration is missing.');if(!await loadSupabase())throw new Error('Supabase library could not load.');client=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}});return client}
 async function pushItems(kind,items){if(!currentUser||!items.length)return;const dbType=({visits:'visit',quiz:'quiz',notes:'note'})[kind];if(!dbType)return;const rows=items.map(item=>({user_id:currentUser.id,id:String(item.id),record_type:dbType,payload:item,created_at:item.at||now()}));const {error}=await client.from('student_learning_records').upsert(rows,{onConflict:'user_id,id'});if(error)throw error}
 async function syncNow(){if(syncing)return false;syncing=true;try{const c=await getClient();const {data:sessionData,error:sessionError}=await c.auth.getSession();if(sessionError)throw sessionError;currentUser=sessionData.session?.user||null;if(!currentUser){setStatus('Sign in first to enable cloud sync.');return false}activateUserScope(currentUser.id);const {data:rows,error}=await c.from('student_learning_records').select('id,record_type,payload,created_at').eq('user_id',currentUser.id).order('created_at',{ascending:false}).limit(1000);if(error)throw error;const merged=readLocal();for(const row of rows||[]){const kind=({visit:'visits',quiz:'quiz',note:'notes'})[row.record_type];if(!kind)continue;const item=row.payload||{};if(!item.id)item.id=row.id;merged[kind]=merged[kind]||[];if(!merged[kind].some(x=>String(x.id)===String(item.id)))merged[kind].push(item)}saveLocal(merged);data=merged;for(const kind of ['visits','quiz','notes'])await pushItems(kind,merged[kind]||[]);syncReady=true;setStatus('Cloud sync is on · Last synced '+new Date().toLocaleTimeString());notify();return true}catch(e){setStatus('Cloud sync unavailable: '+(e?.message||'check setup'));return false}finally{syncing=false}}
 async function enableCloudSync(){try{const c=await getClient();const {data:s,error}=await c.auth.getSession();if(error)throw error;currentUser=s.session?.user||null;if(!currentUser){setStatus('Please sign in before enabling cloud sync.');return false}localStorage.setItem(syncKey,'yes');setStatus('Enabling secure sync…');return await syncNow()}catch(e){setStatus('Could not enable sync: '+(e?.message||'check setup'));return false}}
 function disableCloudSync(){localStorage.removeItem(syncKey);setStatus('Cloud sync is off. Existing cloud records are not deleted.');return true}
 async function deleteCloud(kind,id){if(!currentUser||!syncEnabled())return;try{const dbType=({visits:'visit',quiz:'quiz',notes:'note'})[kind]||kind;let q=client.from('student_learning_records').delete().eq('user_id',currentUser.id).eq('record_type',dbType);if(id)q=q.eq('payload->>id',String(id));const {error}=await q;if(error)throw error}catch(e){setStatus('Cloud delete did not finish: '+e.message)}}
 window.VN_LEARNING={getData:()=>readLocal(),saveNote:(text,subject='General')=>{if(!String(text||'').trim())return false;add('notes',{id:makeId(),subject:String(subject).slice(0,80),text:String(text).slice(0,12000),at:now()});return true},saveQuizResult:(result)=>{if(!result||typeof result!=='object')return false;add('quiz',{id:makeId(),page,title:String(result.title||'Mock exam'),at:now(),action:'Mock exam completed',score:Number(result.score)||0,total:Number(result.total)||0,percentage:Number(result.percentage)||0});return true},deleteNote:id=>{data=readLocal();data.notes=(data.notes||[]).filter(n=>String(n.id)!==String(id));saveLocal(data);deleteCloud('notes',id);notify()},clearHistory:kind=>{if(!['visits','quiz','ai'].includes(kind))return;data=readLocal();data[kind]=[];saveLocal(data);if(kind!=='ai')deleteCloud(kind);notify()},enableCloudSync,disableCloudSync,syncNow,getSyncStatus:()=>({enabled:syncEnabled(),status}),isCloudReady:()=>syncReady};
 // Only initialise the account listener when the user explicitly opted in.
 if(syncEnabled())getClient().then(c=>c.auth.onAuthStateChange((event,session)=>{currentUser=session?.user||null;if(currentUser)syncNow();else{activeUserId=null;activeLocalKey=localKey;data=readLocal();setStatus('Signed out · local guest activity is separate from account records.')}})).then(()=>syncNow()).catch(e=>setStatus('Cloud sync needs setup: '+e.message));
})();
