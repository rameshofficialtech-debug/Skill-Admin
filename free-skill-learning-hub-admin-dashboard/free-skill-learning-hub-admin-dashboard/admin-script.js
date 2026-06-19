const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const store = {
  get(key, fallback){
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) { return fallback; }
  },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
};

const demo = {
  courses:[
    {id:1,name:'Google AI Essentials',category:'AI & ML',level:'Beginner',duration:'8 hours',link:'https://grow.google/certificates/',certificate:'Yes'},
    {id:2,name:'Python for Beginners',category:'Python',level:'Beginner',duration:'4 weeks',link:'https://www.python.org/about/gettingstarted/',certificate:'No'},
    {id:3,name:'Cisco Networking Basics',category:'Networking',level:'Beginner',duration:'15 hours',link:'https://skillsforall.com/',certificate:'Yes'}
  ],
  certificates:[
    {id:1,company:'Google',title:'Google Career Certificates',link:'https://grow.google/certificates/',type:'Free',logo:'G'},
    {id:2,company:'Microsoft',title:'Microsoft Learn Badges',link:'https://learn.microsoft.com/',type:'Free',logo:'M'},
    {id:3,company:'IBM',title:'IBM SkillsBuild Certificate',link:'https://skillsbuild.org/',type:'Free',logo:'I'}
  ],
  students:[
    {id:1,name:'Ramesh S',email:'ramesh@example.com',date:'2026-06-01',course:'Google AI Essentials',progress:75},
    {id:2,name:'Santhosh Kumar',email:'santhosh@example.com',date:'2026-06-07',course:'Python for Beginners',progress:42},
    {id:3,name:'Priya R',email:'priya@example.com',date:'2026-06-12',course:'Cisco Networking Basics',progress:90}
  ],
  tips:[
    {id:1,title:'Learn one skill daily',category:'Study Plan',description:'Spend 60 minutes daily and build small projects.'},
    {id:2,title:'Use official links',category:'Certificates',description:'Always learn from official company course pages.'}
  ],
  content:{hero:'Learn Skills for Free & Earn Certificates',subtitle:'Find free courses, certificates and step-by-step learning tips.',cta1:'Start Learning',cta2:'Explore Certificates',footer:'freeskilllearninghub@example.com',social:'https://linkedin.com'}
};

function initData(){Object.keys(demo).forEach(k=>{if(!localStorage.getItem('fslh_'+k)) store.set('fslh_'+k,demo[k]);});}
function data(k){return store.get('fslh_'+k,demo[k]);}
function save(k,v){store.set('fslh_'+k,v);}
function nextId(arr){return arr.length ? Math.max(...arr.map(x=>x.id))+1 : 1;}
function pageName(){return document.body.dataset.page;}
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function safeUrl(value=''){try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?escapeHtml(url.href):'#';}catch(error){return '#';}}
function emptyRow(columns,message){return `<tr><td class="empty-state" colspan="${columns}"><i class="fa-regular fa-folder-open"></i><span>${message}</span></td></tr>`;}
function showToast(message){
  let toast=$('#toast');
  if(!toast){toast=document.createElement('div');toast.id='toast';document.body.appendChild(toast);}
  toast.className='toast show'; toast.innerHTML=`<i class="fa-solid fa-circle-check"></i><span>${escapeHtml(message)}</span>`;
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove('show'),2600);
}

function setupLayout(){
  const btn=$('.menu-btn'), side=$('.sidebar');
  if(btn&&side){
    const overlay=document.createElement('button'); overlay.className='sidebar-overlay'; overlay.setAttribute('aria-label','Close navigation'); document.body.appendChild(overlay);
    const closeSide=()=>{side.classList.remove('open');overlay.classList.remove('show');btn.setAttribute('aria-expanded','false');};
    btn.setAttribute('aria-label','Open navigation'); btn.setAttribute('aria-expanded','false');
    btn.onclick=()=>{const open=side.classList.toggle('open');overlay.classList.toggle('show',open);btn.setAttribute('aria-expanded',String(open));}; overlay.onclick=closeSide;
  }
  $$('.nav-links a').forEach(a=>{ if(a.href.includes(location.pathname.split('/').pop())) a.classList.add('active'); });
  const logout=$('#logoutBtn'); if(logout) logout.onclick=()=>{localStorage.removeItem('fslh_logged'); location.href='admin-login.html'};
  const user=store.get('fslh_profile',{name:'Admin User',email:'admin@fslh.com'});
  $$('.admin-chip span').forEach(el=>el.textContent=user.name);
  $$('.admin-chip img').forEach(img=>{img.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff`;img.alt=user.name;});
}

function login(){
  const form=$('#loginForm'); if(!form) return;
  form.onsubmit=e=>{e.preventDefault(); localStorage.setItem('fslh_logged','yes'); location.href='admin-dashboard.html';};
}

function dashboard(){
  if(pageName()!=='dashboard') return;
  if ($('#totalCourses')) $('#totalCourses').textContent=data('courses').length;
  if ($('#totalCertificates')) $('#totalCertificates').textContent=data('certificates').length;
  if ($('#totalStudents')) $('#totalStudents').textContent=data('students').length;
  if ($('#activeUsers')) $('#activeUsers').textContent=data('students').filter(s=>s.progress>40).length;
}

const subscriptionStoreKey='skillHubSubscriptions';
const currentSubscriptionKey='skillHubCurrentSubscription';
const subscriptionPlans={Monthly:{label:'Monthly Plan',amount:30,months:1},'3 Months':{label:'3 Months Plan',amount:50,months:3},'6 Months':{label:'6 Months Plan',amount:80,months:6}};

function subscriptions(){return store.get(subscriptionStoreKey,[]);}
function saveSubscriptions(items){store.set(subscriptionStoreKey,items);}
function addPlanMonths(value,months){const date=new Date(value);const day=date.getDate();date.setDate(1);date.setMonth(date.getMonth()+Number(months));const lastDay=new Date(date.getFullYear(),date.getMonth()+1,0).getDate();date.setDate(Math.min(day,lastDay));return date.toISOString();}
function subscriptionState(item){
  if(['rejected','cancelled','expired'].includes(item.status)) return item.status;
  if(item.paymentStatus==='received'||item.paymentStatus==='paid'||item.status==='active') return new Date(item.expiryDate)<new Date()?'expired':'active';
  if(item.verificationStatus!=='approved') return 'pending-verification';
  return new Date(item.trialEndDate)<=new Date()?'payment-required':'trial-active';
}
function stateText(state){return ({'pending-verification':'Pending Verification','trial-active':'Free Trial Active','payment-required':'Payment Required',active:'Active',expired:'Expired',cancelled:'Cancelled',rejected:'Rejected'})[state]||state;}
function dateText(value){if(!value)return 'Not set';const date=new Date(value);return Number.isNaN(date.getTime())?'Not set':new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(date);}
function statusBadge(state){return `<span class="badge subscription-status status-${state}">${escapeHtml(stateText(state))}</span>`;}
function subscriptionCounts(items=subscriptions()){const states=items.map(subscriptionState);return {total:items.length,pending:states.filter(x=>x==='pending-verification').length,trial:states.filter(x=>x==='trial-active').length,payment:states.filter(x=>x==='payment-required').length,active:states.filter(x=>x==='active').length,expired:states.filter(x=>x==='expired').length};}

function renderSubscriptionDashboard(){
  if(!$('#totalSubscribers'))return;
  const items=subscriptions(),counts=subscriptionCounts(items);
  $('#totalSubscribers').textContent=counts.total;$('#pendingVerifications').textContent=counts.pending;$('#trialActiveUsers').textContent=counts.trial;$('#paymentRequiredUsers').textContent=counts.payment;$('#paidActiveUsers').textContent=counts.active;$('#expiredSubscriptions').textContent=counts.expired;
  const icons={'pending-verification':'fa-paper-plane','trial-active':'fa-gift','payment-required':'fa-wallet',active:'fa-circle-check',expired:'fa-calendar-xmark',cancelled:'fa-ban',rejected:'fa-xmark'};
  const activityText={'pending-verification':'New subscription request','trial-active':'Trial activated','payment-required':'Payment required',active:'Payment received',expired:'Subscription expired',cancelled:'Subscription cancelled',rejected:'Request rejected'};
  const recent=[...items].sort((a,b)=>new Date(b.updatedAt||b.paymentReceivedAt||b.verifiedAt||b.startDate)-new Date(a.updatedAt||a.paymentReceivedAt||a.verifiedAt||a.startDate)).slice(0,5);
  $('#subscriptionActivities').innerHTML=recent.length?recent.map(item=>{const state=subscriptionState(item);return `<div class="activity"><i class="fa-solid ${icons[state]||'fa-bell'}"></i><div><b>${activityText[state]||'Subscription updated'}</b><p>${escapeHtml(item.name||'Student')} - ${escapeHtml(item.planLabel||item.plan||'Plan')}</p></div></div>`;}).join(''):`<div class="empty-state"><i class="fa-regular fa-folder-open"></i><span>No subscription activity yet</span></div>`;
}

function subscriptionActions(item,state){
  const id=escapeHtml(item.id);
  const button=(action,label,icon,disabled=false,kind='')=>`<button class="action-btn ${kind}" data-subscription-id="${id}" data-subscription-action="${action}" ${disabled?'disabled':''}><i class="fa-solid ${icon}"></i>${label}</button>`;
  return `<div class="subscription-actions">${button('approve','Approve Verification','fa-user-check',state!=='pending-verification','approve')}${button('reject','Reject Request','fa-xmark',state!=='pending-verification','reject')}${button('payment','Mark Payment Received','fa-indian-rupee-sign',!['trial-active','payment-required'].includes(state),'payment')}${button('expire','Mark as Expired','fa-calendar-xmark',state!=='active','expire')}${button('cancel','Cancel Subscription','fa-ban',['cancelled','rejected','expired'].includes(state),'cancel')}${button('delete','Delete','fa-trash',false,'delete')}</div>`;
}

function renderSubscriptions(){
  const body=$('#subscriptionTable');if(!body)return;
  const query=($('#subscriptionSearch')?.value||'').trim().toLowerCase(),filter=$('#subscriptionFilter')?.value||'all';
  const rows=subscriptions().filter(item=>{const haystack=[item.name,item.email,item.phone,item.plan,item.planLabel].join(' ').toLowerCase();const state=subscriptionState(item);return (!query||haystack.includes(query))&&(filter==='all'||state===filter);});
  body.innerHTML=rows.length?rows.map(item=>{const state=subscriptionState(item);const paymentStatus=item.paymentStatus==='received'||item.paymentStatus==='paid'?'Paid':state==='payment-required'?'Required':'Not Required';return `<tr><td><strong>${escapeHtml(item.name||'Unknown')}</strong></td><td>${escapeHtml(item.email||'Not provided')}</td><td>${escapeHtml(item.phone||'Not provided')}</td><td>${escapeHtml(item.planLabel||item.plan||'Not selected')}</td><td>&#8377;${escapeHtml(item.amount??subscriptionPlans[item.plan]?.amount??0)}</td><td>${dateText(item.trialStartDate||item.startDate)}</td><td>${dateText(item.trialEndDate)}</td><td>${state==='active'||state==='expired'?dateText(item.expiryDate):'Not started'}</td><td>${escapeHtml(item.paymentMethod||'UPI AutoPay')}</td><td><span class="payment-label">${paymentStatus}</span></td><td>${statusBadge(state)}</td><td>${subscriptionActions(item,state)}</td></tr>`;}).join(''):emptyRow(12,'No matching subscription requests');
}

function updateSubscription(id,action){
  const current=subscriptions(),target=current.find(item=>item.id===id);if(!target)return;
  if(action==='delete'&&!confirm('Delete this subscription request permanently?'))return;
  if(action==='cancel'&&!confirm('Cancel this subscription?'))return;
  if(action==='delete'){
    saveSubscriptions(current.filter(item=>item.id!==id));
    if(localStorage.getItem(currentSubscriptionKey)===id)localStorage.removeItem(currentSubscriptionKey);
    showToast('Subscription deleted');renderSubscriptions();renderSubscriptionDashboard();return;
  }
  const now=new Date(),updated={...target,updatedAt:now.toISOString()};
  if(action==='approve'){
    const trialEnd=new Date(now);trialEnd.setDate(trialEnd.getDate()+7);
    Object.assign(updated,{verificationStatus:'approved',status:'trial-active',paymentStatus:'not-required',trialStartDate:now.toISOString(),trialEndDate:trialEnd.toISOString(),verifiedAt:now.toISOString()});
  }
  if(action==='reject')Object.assign(updated,{verificationStatus:'rejected',status:'rejected',rejectedAt:now.toISOString()});
  if(action==='payment'){
    const months=updated.months||subscriptionPlans[updated.plan]?.months||1;
    Object.assign(updated,{paymentStatus:'received',status:'active',paymentReceivedAt:now.toISOString(),expiryDate:addPlanMonths(now,months)});
  }
  if(action==='expire')Object.assign(updated,{status:'expired',expiredAt:now.toISOString()});
  if(action==='cancel')Object.assign(updated,{status:'cancelled',autoPay:false,cancelledAt:now.toISOString()});
  saveSubscriptions(current.map(item=>item.id===id?updated:item));
  const messages={approve:'Free trial approved and activated',reject:'Subscription request rejected',payment:'Payment marked as received',expire:'Subscription marked as expired',cancel:'Subscription cancelled'};
  showToast(messages[action]||'Subscription updated');renderSubscriptions();renderSubscriptionDashboard();
}

function openModal(title, fields, onSave, values={}){
  const modal=$('#modal'); const body=$('#modalBody'); if(!modal) return;
  $('#modalTitle').textContent=title;
  body.innerHTML=fields.map(f=>`<div class="input-group ${f.wide?'wide':''}"><label for="${f.id}">${f.label}</label><div class="input-icon"><i class="${f.icon||'fa-solid fa-pen'}"></i>${f.type==='select'?`<select id="${f.id}" required>${f.options.map(o=>`<option ${values[f.id]===o?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select>`:f.type==='textarea'?`<textarea id="${f.id}" rows="4" required>${escapeHtml(values[f.id]||'')}</textarea>`:`<input id="${f.id}" type="${f.type||'text'}" value="${escapeHtml(values[f.id]||'')}" required>`}</div></div>`).join('');
  modal.classList.remove('hidden');
  setTimeout(()=>body.querySelector('input,select,textarea')?.focus(),0);
  $('#saveModal').classList.remove('hidden');
  $('#saveModal').onclick=()=>{const inputs=[...body.querySelectorAll('input,select,textarea')];if(!inputs.every(input=>input.reportValidity()))return;const obj={...values};fields.forEach(f=>obj[f.id]=$('#'+f.id).value.trim());onSave(obj);modal.classList.add('hidden');showToast(`${title} saved`);};
}
function closeModal(){const m=$('#modal'); if(m) m.classList.add('hidden');}
window.closeModal=closeModal;
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();});

function renderCourses(){
  const tbody=$('#coursesTable'); if(!tbody) return; let rows=data('courses');
  const q=($('#searchInput')?.value||'').toLowerCase(), f=$('#filterSelect')?.value||'All';
  rows=rows.filter(c=>(c.name+c.category+c.level).toLowerCase().includes(q)&&(f==='All'||c.category===f));
  tbody.innerHTML=rows.length?rows.map(c=>`<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.category)}</td><td>${escapeHtml(c.level)}</td><td>${escapeHtml(c.duration)}</td><td><a target="_blank" rel="noopener" href="${safeUrl(c.link)}">Open</a></td><td><span class="badge ${c.certificate.toLowerCase()}">${escapeHtml(c.certificate)}</span></td><td class="actions"><button class="icon-btn" aria-label="Edit course" onclick="editCourse(${c.id})"><i class="fa-solid fa-pen"></i></button><button class="icon-btn" aria-label="Delete course" onclick="deleteItem('courses',${c.id},renderCourses)"><i class="fa-solid fa-trash"></i></button></td></tr>`).join(''):emptyRow(7,'No courses found');
}
function courseForm(v={}){openModal(v.id?'Edit Course':'Add Course',[{id:'name',label:'Course name',icon:'fa-solid fa-book'},{id:'category',label:'Category',type:'select',options:['Web Development','AI & ML','Data Analytics','Digital Marketing','UI/UX','Python','Java','Networking']},{id:'level',label:'Level',type:'select',options:['Beginner','Intermediate','Advanced']},{id:'duration',label:'Duration',icon:'fa-solid fa-clock'},{id:'link',label:'Official course link',icon:'fa-solid fa-link',wide:true},{id:'certificate',label:'Certificate available',type:'select',options:['Yes','No']}], obj=>{let arr=data('courses'); if(obj.id) arr=arr.map(x=>x.id===obj.id?obj:x); else arr.push({...obj,id:nextId(arr)}); save('courses',arr); renderCourses();},v)}
window.editCourse=id=>courseForm(data('courses').find(x=>x.id===id));

function renderCertificates(){const t=$('#certTable');if(!t)return;const q=($('#searchInput')?.value||'').toLowerCase();const rows=data('certificates').filter(c=>(c.company+c.title).toLowerCase().includes(q));t.innerHTML=rows.length?rows.map(c=>`<tr><td><div class="logo-placeholder">${escapeHtml(c.logo||c.company[0])}</div></td><td>${escapeHtml(c.company)}</td><td>${escapeHtml(c.title)}</td><td><a target="_blank" rel="noopener" href="${safeUrl(c.link)}">Open</a></td><td><span class="badge ${c.type.toLowerCase()}">${escapeHtml(c.type)}</span></td><td class="actions"><button class="icon-btn" aria-label="Edit provider" onclick="editCert(${c.id})"><i class="fa-solid fa-pen"></i></button><button class="icon-btn" aria-label="Delete provider" onclick="deleteItem('certificates',${c.id},renderCertificates)"><i class="fa-solid fa-trash"></i></button></td></tr>`).join(''):emptyRow(6,'No certificate providers found')}
function certForm(v={}){openModal(v.id?'Edit Provider':'Add Provider',[{id:'company',label:'Company name'},{id:'title',label:'Certificate title'},{id:'link',label:'Official certificate link',wide:true},{id:'type',label:'Free/Paid badge',type:'select',options:['Free','Paid']},{id:'logo',label:'Logo placeholder letter'}],obj=>{let arr=data('certificates'); if(obj.id) arr=arr.map(x=>x.id===obj.id?obj:x); else arr.push({...obj,id:nextId(arr)}); save('certificates',arr); renderCertificates();},v)}
window.editCert=id=>certForm(data('certificates').find(x=>x.id===id));

function renderStudents(){const t=$('#studentsTable');if(!t)return;const q=($('#searchInput')?.value||'').toLowerCase();const rows=data('students').filter(s=>(s.name+s.email+s.course).toLowerCase().includes(q));t.innerHTML=rows.length?rows.map(s=>`<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.email)}</td><td>${escapeHtml(s.date)}</td><td>${escapeHtml(s.course)}</td><td><div class="progress"><span style="width:${Math.min(100,Math.max(0,Number(s.progress)))}%"></span></div> ${escapeHtml(s.progress)}%</td><td><button class="secondary-btn" onclick="viewStudent(${s.id})">View</button></td></tr>`).join(''):emptyRow(6,'No students found')}
window.viewStudent=id=>{const s=data('students').find(item=>item.id===id);if(!s)return;openModal('Student Details',[{id:'name',label:'Name'},{id:'email',label:'Email',type:'email'},{id:'date',label:'Joined date',type:'date'},{id:'course',label:'Course enrolled'},{id:'progress',label:'Progress (%)',type:'number'}],()=>{},s);$('#saveModal').classList.add('hidden');$('#modalBody').querySelectorAll('input').forEach(input=>input.disabled=true);};

function renderTips(){const t=$('#tipsTable');if(!t)return;const rows=data('tips');t.innerHTML=rows.length?rows.map(x=>`<tr><td>${escapeHtml(x.title)}</td><td>${escapeHtml(x.category)}</td><td>${escapeHtml(x.description)}</td><td class="actions"><button class="icon-btn" aria-label="Edit tip" onclick="editTip(${x.id})"><i class="fa-solid fa-pen"></i></button><button class="icon-btn" aria-label="Delete tip" onclick="deleteItem('tips',${x.id},renderTips)"><i class="fa-solid fa-trash"></i></button></td></tr>`).join(''):emptyRow(4,'No learning tips added')}
function tipForm(v={}){openModal(v.id?'Edit Tip':'Add Tip',[{id:'title',label:'Tip title'},{id:'category',label:'Tips category'},{id:'description',label:'Description',type:'textarea',wide:true}],obj=>{let arr=data('tips'); if(obj.id) arr=arr.map(x=>x.id===obj.id?obj:x); else arr.push({...obj,id:nextId(arr)}); save('tips',arr); renderTips();},v)}
window.editTip=id=>tipForm(data('tips').find(x=>x.id===id));

window.deleteItem=(key,id,cb)=>{if(confirm('Delete this item?')){save(key,data(key).filter(x=>x.id!==id));cb();showToast('Item deleted');}};
function contentSettings(){const f=$('#contentForm'); if(!f)return; const c=data('content'); Object.keys(c).forEach(k=>{if($('#'+k)) $('#'+k).value=c[k]}); f.onsubmit=e=>{e.preventDefault(); const obj={}; ['hero','subtitle','cta1','cta2','footer','social'].forEach(k=>obj[k]=$('#'+k).value); save('content',obj); alert('Content settings saved!')};}
function profile(){const f=$('#profileForm');if(!f)return;const p=store.get('fslh_profile',{name:'Admin User',email:'admin@fslh.com'});$('#adminName').value=p.name;$('#adminEmail').value=p.email;f.onsubmit=e=>{e.preventDefault();save('profile',{name:$('#adminName').value.trim(),email:$('#adminEmail').value.trim()});showToast('Profile updated');$$('.admin-chip span').forEach(el=>el.textContent=$('#adminName').value.trim());};}

document.addEventListener('DOMContentLoaded',()=>{initData();setupLayout();login();dashboard();renderSubscriptionDashboard();renderSubscriptions();renderCourses();renderCertificates();renderStudents();renderTips();contentSettings();profile();$('#addCourse')?.addEventListener('click',()=>courseForm());$('#addCert')?.addEventListener('click',()=>certForm());$('#addTip')?.addEventListener('click',()=>tipForm());$('#searchInput')?.addEventListener('input',()=>{renderCourses();renderCertificates();renderStudents();});$('#filterSelect')?.addEventListener('change',renderCourses);$('#subscriptionSearch')?.addEventListener('input',renderSubscriptions);$('#subscriptionFilter')?.addEventListener('change',renderSubscriptions);$('#subscriptionTable')?.addEventListener('click',event=>{const button=event.target.closest('[data-subscription-action]');if(button&&!button.disabled)updateSubscription(button.dataset.subscriptionId,button.dataset.subscriptionAction);});$('#modal')?.addEventListener('click',event=>{if(event.target.id==='modal')closeModal();});});
