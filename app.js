/* ============================================================
   ۱) اطلاعات Supabase
   ============================================================ */
const SUPABASE_URL = "https://ttffiyxqxphixryjavq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_WetuCjAtn1DCom1pOF3SKw_fxMbJdr_";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

/* ============================================================
   اعضا
   ============================================================ */
const members=[
 {name:"اسم عضو ۱",role:"عضو گروه TEEN MONSTER",emoji:"🦊",bio:"اینجا درباره عضو اول بنویس."},
 {name:"اسم عضو ۲",role:"عضو گروه TEEN MONSTER",emoji:"🐈",bio:"اینجا درباره عضو دوم بنویس."},
 {name:"اسم عضو ۳",role:"عضو گروه TEEN MONSTER",emoji:"🦌",bio:"اینجا درباره عضو سوم بنویس."},
 {name:"اسم عضو ۴",role:"عضو گروه TEEN MONSTER",emoji:"🐰",bio:"اینجا درباره عضو چهارم بنویس."},
 {name:"اسم عضو ۵",role:"عضو گروه TEEN MONSTER",emoji:"🦥",bio:"اینجا درباره عضو پنجم بنویس."},
 {name:"اسم عضو ۶",role:"عضو گروه TEEN MONSTER",emoji:"🐳",bio:"اینجا درباره عضو ششم بنویس."},
 {name:"اسم عضو ۷",role:"عضو گروه TEEN MONSTER",emoji:"🐼",bio:"اینجا درباره عضو هفتم بنویس."}
];
let songs=JSON.parse(localStorage.getItem("tm_songs")||"[]");
let activeMember=null;
let isAdmin=false;
const $=id=>document.getElementById(id);

function getMemberPhotos(){try{return JSON.parse(localStorage.getItem("tm_member_photos")||"{}")}catch(e){return {}}}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function openModal(id){$(id).classList.add("show")}
function closeModal(id){$(id).classList.remove("show")}

/* ============================================================
   رندر
   ============================================================ */
function renderMembers(){
 const photos=getMemberPhotos();
 $("membersGrid").innerHTML=members.map((m,i)=>`<article class="member"><button style="display:block;width:100%;padding:0;background:none;border:0;color:white;text-align:right" data-member="${i}"><div class="portrait">${photos[i]?`<img src="${photos[i]}" alt="${escapeHtml(m.name)}">`:m.emoji}</div><div class="member-info"><b>${escapeHtml(m.name)}</b><span>${escapeHtml(m.role)} · مشاهده پروفایل ↗</span></div></button>${isAdmin?`<div class="member-tools"><label>＋ عکس<input type="file" accept="image/*" data-photo="${i}"></label><button type="button" class="btn ghost" style="padding:6px 8px;font-size:11px;margin:5px 0" data-edit-member="${i}">✎ ویرایش</button></div>`:""}</article>`).join("");
}
function renderSongs(){
 const q=$("songSearch").value.trim().toLowerCase();
 const filtered=songs.filter(s=>s.title.toLowerCase().includes(q));
 $("trackList").innerHTML=filtered.length?filtered.map(s=>`<div class="track"><div class="cover">♫</div><div class="track-info"><b>${escapeHtml(s.title)}</b><small>TEEN MONSTER</small></div><button aria-label="پخش" data-play="${s.id}">▶</button></div>`).join(""):'<div class="empty">هنوز آهنگی اضافه نشده.</div>';
}
function setSong(s){$("audioPlayer").src=s.url;$("nowTitle").textContent=s.title;$("nowArtist").textContent="TEEN MONSTER";$("audioPlayer").play().catch(()=>{});}

function updateAdminUI(){
 document.querySelectorAll(".admin-only").forEach(el=>el.classList.toggle("hidden",!isAdmin));
 $("adminBadge").textContent=isAdmin?"✓ مدیر وارد شده":"افزودن محتوا فقط برای مدیر";
 renderMembers();
}

/* ============================================================
   رویدادهای اعضا
   ============================================================ */
$("membersGrid").addEventListener("click",e=>{
 if(e.target.closest("label")||e.target.matches("input"))return;
 const b=e.target.closest("[data-member]");
 if(!b)return;
 activeMember=members[+b.dataset.member];
 $("memberTitle").textContent=activeMember.name;
 $("memberRole").textContent=activeMember.role;
 $("memberBio").textContent=activeMember.bio;
 $("chatBox").innerHTML='<div class="bubble">سلام! خوش اومدی 👋</div>';
 openModal("memberModal");
});
$("membersGrid").addEventListener("click",e=>{
 const btn=e.target.closest("[data-edit-member]");
 if(!btn)return;
 if(!isAdmin){alert("فقط مدیر می‌تواند ویرایش کند.");return;}
 const i=Number(btn.dataset.editMember),m=members[i];
 $("editMemberIndex").value=i;
 $("editMemberName").value=m.name;
 $("editMemberBio").value=m.bio;
 openModal("editMemberModal");
});
$("editMemberForm").addEventListener("submit",e=>{
 e.preventDefault();
 if(!isAdmin)return;
 const i=Number($("editMemberIndex").value);
 members[i].name=$("editMemberName").value.trim();
 members[i].bio=$("editMemberBio").value.trim();
 try{localStorage.setItem("tm_members_data",JSON.stringify(members));}catch(err){}
 renderMembers();
 closeModal("editMemberModal");
});
$("membersGrid").addEventListener("change",e=>{
 const input=e.target.closest("[data-photo]");
 if(!isAdmin||!input||!input.files[0])return;
 const file=input.files[0];
 if(!file.type.startsWith("image/")){alert("فایل عکس انتخاب کن.");return;}
 if(file.size>1.5*1024*1024){alert("عکس باید کمتر از ۱.۵ مگابایت باشد.");return;}
 const reader=new FileReader();
 reader.onload=()=>{
  const photos=getMemberPhotos();
  photos[input.dataset.photo]=reader.result;
  try{localStorage.setItem("tm_member_photos",JSON.stringify(photos));renderMembers();}
  catch(err){alert("فضا پر شده.");}
 };
 reader.readAsDataURL(file);
});

/* ============================================================
   آهنگ
   ============================================================ */
$("trackList").addEventListener("click",e=>{
 const b=e.target.closest("[data-play]");
 if(!b)return;
 const s=songs.find(x=>x.id===b.dataset.play);
 if(s)setSong(s);
});
$("songSearch").addEventListener("input",renderSongs);

/* ============================================================
   مودال‌ها
   ============================================================ */
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
document.querySelectorAll(".modal-bg").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)closeModal(m.id)}));

$("chatForm").addEventListener("submit",e=>{
 e.preventDefault();
 const v=$("chatInput").value.trim();
 if(!v)return;
 $("chatBox").insertAdjacentHTML("beforeend",`<div class="bubble me">${escapeHtml(v)}</div>`);
 $("chatInput").value="";
 $("chatBox").scrollTop=$("chatBox").scrollHeight;
});

/* ============================================================
   حساب کاربری
   ============================================================ */
$("accountBtn").addEventListener("click",()=>{
 const current=localStorage.getItem("tm_demo_user");
 openModal("accountModal");
 if(current)showUserDashboard(current);else resetAccountView();
});
$("uploadBtn").onclick=()=>openModal("uploadModal");

function showUserDashboard(name,email=""){
 $("accountForm").style.display="none";
 $("userDashboard").style.display="block";
 $("dashboardName").textContent="نام کاربری: "+name;
 $("dashboardEmail").textContent="ایمیل: "+(email||"ثبت نشده");
 $("accountBtn").textContent=name;
}
function setSignedIn(name,email=""){
 localStorage.setItem("tm_demo_user",name);
 showUserDashboard(name,email);
}
function resetAccountView(){
 $("accountForm").style.display="flex";
 $("userDashboard").style.display="none";
 $("accountStatus").textContent="";
}
function authErrorMessage(error){
 const msg=(error&&error.message)||"خطای ناشناخته";
 if(msg.toLowerCase().includes("invalid login credentials"))return "ایمیل یا رمز عبور درست نیست.";
 if(msg.toLowerCase().includes("email not confirmed"))return "اول ایمیلت را تأیید کن.";
 if(msg.toLowerCase().includes("user already registered"))return "این ایمیل قبلاً ثبت‌نام کرده.";
 return "خطا: "+msg;
}
$("userLogoutBtn").addEventListener("click",async()=>{
 await supabaseClient.auth.signOut();
 localStorage.removeItem("tm_demo_user");
 $("accountBtn").textContent="ورود / ثبت‌نام";
 resetAccountView();
});
$("accountForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const n=$("username").value.trim();
 const email=$("email").value.trim().toLowerCase();
 const password=$("password").value;
 if(!n||!email){$("accountStatus").textContent="همه فیلدها را پر کن.";return;}
 if(password.length<6){$("accountStatus").textContent="رمز باید حداقل ۶ کاراکتر باشد.";return;}
 $("accountStatus").textContent="در حال ساخت حساب…";
 const {data,error}=await supabaseClient.auth.signUp({email,password,options:{data:{display_name:n}}});
 if(error){$("accountStatus").textContent=authErrorMessage(error);return;}
 if(data.session){
  setSignedIn(n,email);
  $("accountStatus").textContent="حساب ساخته شد ✅";
  await refreshAdminRole();
  closeModal("accountModal");
 }else{
  $("accountStatus").textContent="ثبت‌نام ارسال شد. ایمیلت را بررسی کن.";
 }
});
$("loginUserBtn").addEventListener("click",async()=>{
 const email=$("email").value.trim().toLowerCase();
 const password=$("password").value;
 if(!email||!password){$("accountStatus").textContent="ایمیل و رمز را وارد کن.";return;}
 $("accountStatus").textContent="در حال ورود…";
 const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
 if(error){$("accountStatus").textContent=authErrorMessage(error);return;}
 const name=data.user.user_metadata?.display_name||email.split("@")[0];
 setSignedIn(name,email);
 $("accountStatus").textContent="وارد شدی ✅";
 await refreshAdminRole();
 closeModal("accountModal");
});

/* ============================================================
   نقش مدیر
   ============================================================ */
async function refreshAdminRole(){
 const {data:sessionData}=await supabaseClient.auth.getSession();
 const user=sessionData.session?.user;
 if(!user){isAdmin=false;updateAdminUI();return;}
 const {data,error}=await supabaseClient.from("profiles").select("role").eq("id",user.id).maybeSingle();
 isAdmin=!error&&data?.role==="admin";
 updateAdminUI();
}

/* ============================================================
   آپلود آهنگ
   ============================================================ */
$("uploadForm").addEventListener("submit",e=>{
 e.preventDefault();
 if(!isAdmin){alert("فقط مدیر.");return;}
 const file=$("songFile").files[0],title=$("songTitle").value.trim();
 if(!file||!title)return;
 const url=URL.createObjectURL(file);
 songs.unshift({id:String(Date.now()),title,url});
 renderSongs();
 closeModal("uploadModal");
 $("uploadForm").reset();
});

/* ============================================================
   اخبار
   ============================================================ */
const newsListEl=$("newsList");
const newsStatusEl=$("newsStatus");
const coversListEl=$("coversList");
const coverStatusEl=$("coverStatus");

async function loadNews(){
 const {data,error}=await supabaseClient.from("news").select("id,title,body,image_url,created_at").order("created_at",{ascending:false}).limit(50);
 if(error){newsListEl.innerHTML='<div class="empty">خطا: '+escapeHtml(error.message)+'</div>';return;}
 if(!data||!data.length){newsListEl.innerHTML='<div class="empty">هنوز خبری منتشر نشده.</div>';return;}
 newsListEl.innerHTML=data.map(n=>`
  <article class="news-card">
   <h3>${escapeHtml(n.title)}</h3>
   <div class="news-meta">${new Date(n.created_at).toLocaleString('fa-IR',{dateStyle:'medium',timeStyle:'short'})}</div>
   <div class="news-body">${escapeHtml(n.body)}</div>
   ${n.image_url?`<img src="${escapeHtml(n.image_url)}" alt="">`:""}
   ${isAdmin?`<div class="news-actions"><button class="btn ghost" data-del-news="${n.id}">حذف</button></div>`:""}
  </article>`).join("");
}
$("addNewsBtn").addEventListener("click",()=>{
 if(!isAdmin){alert("فقط مدیر.");return;}
 newsStatusEl.textContent="";
 openModal("newsModal");
});
$("newsForm").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!isAdmin){newsStatusEl.textContent="دسترسی نداری.";return;}
 const title=$("newsTitle").value.trim();
 const body=$("newsBody").value.trim();
 const file=$("newsImage").files[0];
 if(!title||!body)return;
 newsStatusEl.textContent="در حال ارسال…";
 try{
  let imageUrl=null;
  if(file){
   const ext=file.name.split('.').pop();
   const path=`news/${Date.now()}.${ext}`;
   const {error:upErr}=await supabaseClient.storage.from("media").upload(path,file);
   if(upErr)throw upErr;
   const {data:urlData}=supabaseClient.storage.from("media").getPublicUrl(path);
   imageUrl=urlData.publicUrl;
  }
  const {data:sessionData}=await supabaseClient.auth.getSession();
  const {error}=await supabaseClient.from("news").insert({title,body,image_url:imageUrl,author_id:sessionData.session.user.id});
  if(error)throw error;
  newsStatusEl.textContent="خبر منتشر شد ✅";
  $("newsForm").reset();
  closeModal("newsModal");
  loadNews();
 }catch(err){newsStatusEl.textContent="خطا: "+(err.message||err);}
});
newsListEl.addEventListener("click",async e=>{
 const btn=e.target.closest("[data-del-news]");
 if(!btn||!isAdmin)return;
 if(!confirm("حذف شود؟"))return;
 const {error}=await supabaseClient.from("news").delete().eq("id",btn.dataset.delNews);
 if(error)alert("حذف نشد: "+error.message);
 else loadNews();
});

/* ============================================================
   کاورها
   ============================================================ */
async function loadCovers(){
 const {data,error}=await supabaseClient.from("covers").select("id,title,image_url,created_at").order("created_at",{ascending:false}).limit(60);
 if(error){coversListEl.innerHTML='<div class="empty">خطا: '+escapeHtml(error.message)+'</div>';return;}
 if(!data||!data.length){coversListEl.innerHTML='<div class="empty">هنوز کاوری اضافه نشده.</div>';return;}
 coversListEl.innerHTML=data.map(c=>`
  <div class="cover-card">
   <img src="${escapeHtml(c.image_url)}" alt="${escapeHtml(c.title)}">
   <b>${escapeHtml(c.title)}</b>
   ${isAdmin?`<button class="btn ghost" style="margin:8px" data-del-cover="${c.id}">حذف</button>`:""}
  </div>`).join("");
}
$("addCoverBtn").addEventListener("click",()=>{
 if(!isAdmin){alert("فقط مدیر.");return;}
 coverStatusEl.textContent="";
 openModal("coverModal");
});
$("coverForm").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!isAdmin){coverStatusEl.textContent="دسترسی نداری.";return;}
 const title=$("coverTitle").value.trim();
 const file=$("coverImage").files[0];
 if(!title||!file)return;
 coverStatusEl.textContent="در حال ارسال…";
 try{
  const ext=file.name.split('.').pop();
  const path=`covers/${Date.now()}.${ext}`;
  const {error:upErr}=await supabaseClient.storage.from("media").upload(path,file);
  if(upErr)throw upErr;
  const {data:urlData}=supabaseClient.storage.from("media").getPublicUrl(path);
  const {data:sessionData}=await supabaseClient.auth.get><spanSession();
  const> {error}=await supabaseClient.from("c${overs").insert({title,image_url:urlchatData.publicUrl,author_id:sessionData.sessionE.user.id});
  if(error)throw error;
  coverscapeStatusEl.textContent="کاور اضافه شد ✅";
  $("coverForm").reset();
  closeModal("coverModal");
  loadCovers();
 }catch(err){coverStatusEl.textContent="خطا: "+(err.message||err);}
});
coversListEl.addEventListener("click",async e=>{
 const btn=e.target.closest("[data-del-cover]");
 if(!btn||!isAdmin)return;
 if(!confirm("حذف شود؟"))return;
 const {error}=await supabaseClient.from("covers").delete().eq("id",btn.dataset.delCover);
 if(error)alert("حذف نشد: "+error.message);
 else loadCovers();
});

/* ============================================================
   چت عمومی
   ============================================================ */
const chatMessagesEl=$("publicChatMessages");
const chatStatusEl=$("publicChatStatus");
const chatConnectionEl=$("chatConnection");
const chatForm=$("publicChatForm");
const chatInput=$("publicChatInput");
let chatUser=null,chatChannel=null;

function chatEscape(v){return String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
function showChatMessages(rows){
 if(!rows||!rows.length){chatMessagesEl.innerHTML='<div class="empty">هنوز پیامی نیست.</div>';return;}
 chatMessagesEl.innerHTML=rows.map(m=>`<div class="chat-message ${chatUser&&m.user_id===chatUser.id?'mine':''}"><div class="chat-meta"><b>${chatEscape(m.display_name||'طرفدار')}</b(new Date(m.created_at).toLocaleString('fa-IR',{dateStyle:'short',timeStyle:'short'}))}</span></div><div class="chat-text">${chatEscape(m.message)}</div></div>`).join('');
 chatMessagesEl.scrollTop=chatMessagesEl.scrollHeight;
}
async function loadPublicChat(){
 const {data:sessionData}=await supabaseClient.auth.getSession();
 chatUser=sessionData.session?.user||null;
 chatStatusEl.textContent=chatUser?'وارد شده‌ای.':'برای ارسال پیام وارد شو.';
 chatInput.disabled=!chatUser;
 chatForm.querySelector('button').disabled=!chatUser;
 const {data,error}=await supabaseClient.from('public_chat_messages').select('id,user_id,display_name,message,created_at').order('created_at',{ascending:true}).limit(100);
 if(error){chatConnectionEl.textContent='آماده نیست';return;}
 showChatMessages(data||[]);
 chatConnectionEl.textContent='🟢 متصل';
 if(chatChannel)await supabaseClient.removeChannel(chatChannel);
 chatChannel=supabaseClient.channel('teen-monster-public-chat').on('postgres_changes',{event:'INSERT',schema:'public',table:'public_chat_messages'},payload=>{
  const row=payload.new;
  if(chatMessagesEl.querySelector(`[data-chat-id="${row.id}"]`))return;
  if(chatMessagesEl.querySelector('.empty'))chatMessagesEl.innerHTML='';
  const div=document.createElement('div');div.className='chat-message '+(chatUser&&row.user_id===chatUser.id?'mine':'');div.dataset.chatId=row.id;
  const meta=document.createElement('div');meta.className='chat-meta';
  const name=document.createElement('b');name.textContent=row.display_name||'طرفدار';
  const time=document.createElement('span');time.textContent=new Date(row.created_at).toLocaleString('fa-IR',{dateStyle:'short',timeStyle:'short'});
  meta.append(name,time);
  const body=document.createElement('div');body.className='chat-text';body.textContent=row.message;
  div.append(meta,body);chatMessagesEl.append(div);chatMessagesEl.scrollTop=chatMessagesEl.scrollHeight;
 }).subscribe();
}
chatForm.addEventListener('submit',async e=>{
 e.preventDefault();
 const message=chatInput.value.trim();
 if(!message)return;
 const {data}=await supabaseClient.auth.getSession();
 chatUser=data.session?.user||null;
 if(!chatUser){chatStatusEl.textContent='اول وارد شو.';return;}
 chatInput.disabled=true;
 const displayName=String(chatUser.user_metadata?.display_name||chatUser.email?.split('@')[0]||'طرفدار').slice(0,30);
 const {error}=await supabaseClient.from('public_chat_messages').insert({user_id:chatUser.id,display_name:displayName,message:message.slice(0,500)});
 chatInput.disabled=false;
 if(error){chatStatusEl.textContent='ارسال نشد: '+error.message;return;}
 chatInput.value='';chatStatusEl.textContent='ارسال شد 💜';
});

/* ============================================================
   عکس کنار عنوان
   ============================================================ */
const heroPhotoInput=$("heroPhotoInput");
const heroPhotoPreview=$("heroPhotoPreview");
function showHeroPhoto(url){heroPhotoPreview.src=url;heroPhotoPreview.classList.add("visible");}
try{const saved=localStorage.getItem("tm_hero_photo");if(saved)showHeroPhoto(saved);}catch(err){}
heroPhotoInput.addEventListener("change",()=>{
 const file=heroPhotoInput.files&&heroPhotoInput.files[0];
 if(!file)return;
 if(!file.type.startsWith("image/")){alert("عکس انتخاب کن.");return;}
 if(file.size>2*1024*1024){alert("کمتر از ۲ مگابایت.");return;}
 const reader=new FileReader();
 reader.onload=()=>{showHeroPhoto(reader.result);try{localStorage.setItem("tm_hero_photo",reader.result);}catch(err){}};
 reader.readAsDataURL(file);
});

/* ============================================================
   شروع
   ============================================================ */
try{
 const savedMembers=JSON.parse(localStorage.getItem("tm_members_data")||"null");
 if(Array.isArray(savedMembers)&&savedMembers.length===members.length){
  savedMembers.forEach((m,i)=>{if(m.name)members[i].name=m.name;if(m.bio)members[i].bio=m.bio;});
 }
}catch(err){}

supabaseClient.auth.getSession().then(({data})=>{
 const user=data.session?.user;
 if(user){
  const name=user.user_metadata?.display_name||user.email?.split("@")[0]||"طرفدار";
  setSignedIn(name,user.email||"");
 }
 refreshAdminRole();
});
supabaseClient.auth.onAuthStateChange(()=>{setTimeout(refreshAdminRole,0);});

renderMembers();
renderSongs();
updateAdminUI();
loadNews();
loadCovers();
loadPublicChat();
