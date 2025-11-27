 // --- Back to Top ---
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y > 300) toTop.classList.add('show');
    else toTop.classList.remove('show');
  });
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

function setMidnightKST() {
  const now = new Date();
  // 한국시간 기준 0시로 맞추기
  const kstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  kstNow.setHours(0,0,0,0);
  
  const y = kstNow.getFullYear();
  const m = String(kstNow.getMonth() + 1).padStart(2, "0");
  const d = String(kstNow.getDate()).padStart(2, "0");
  const hh = String(kstNow.getHours()).padStart(2, "0");
  const mm = String(kstNow.getMinutes()).padStart(2, "0");
  
  document.querySelector(".wk-updated").textContent = `${y}-${m}-${d} ${hh}:${mm}`;
}
setMidnightKST();

fetch('https://mrdindoin.ddns.net/data/views.json', {cache:'no-store'})
  .then(r=>r.json())
  .then(d=>{
    document.getElementById('viewTotal').textContent = d.total;
    document.getElementById('viewToday').textContent = d.today;
  });

const btn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const ovl  = document.getElementById('overlay');

function openMenu(open) {
  if (open) {
    mobileMenu.classList.add('show');
    ovl.classList.add('show');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  } else {
    mobileMenu.classList.remove('show');
    ovl.classList.remove('show');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

btn.addEventListener('click', () => {
  const willOpen = !mobileMenu.classList.contains('show');
  openMenu(willOpen);
});
ovl.addEventListener('click', () => openMenu(false));

// --- Floating words + data hybrid ---
const cloud = document.getElementById('cloud');
const input = document.getElementById('foodInput');
let cloudWidth = cloud.clientWidth;

const DATA_URL = "https://mrdindoin.ddns.net/data/latest-counts.json";

function todayKey(){ return new Date().toISOString().slice(0,10); }

function makeSizeScaler(items){
  const counts = items.map(i => Number(i.count) || 1);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const span = max - min;

  const rankMap = new Map(items.map((it, i) => [it.food, i + 1]));
  const N = items.length || 1;

  return (count, food) => {
    if (span >= 1) {
      const t = (count - min) / span;
      return 14 + t * (28 - 14);
    } else {
      const r = rankMap.get(food) || N;
      const rt = (N - r) / Math.max(1, N - 1);
      const jitter = 0.9 + Math.random()*0.2;
      return (16 + rt * (30 - 16)) * jitter;
    }
  };
}

function mapCountsToItems(json){
  const arr = Array.isArray(json?.top) ? json.top : [];
  return arr.map((it,i)=>({
    food: String(it.food||'').trim(),
    count: Number(it.count)||1,
    rank: i+1
  }));
}

async function fetchWithTimeout(url, ms=4000, opts={}){
  const c = new AbortController();
  const id = setTimeout(()=>c.abort(), ms);
  try { return await fetch(url, { ...opts, signal:c.signal }); }
  finally { clearTimeout(id); }
}

   
function spawn(arg1, arg2){
  let item = (typeof arg1 === 'object') ? arg1 : { food: String(arg1), count: 1, rank: 99 };
  const scale = (typeof arg2 === 'function') ? arg2 : null;

  const el = document.createElement('div');
  el.className = 'word';
  el.textContent = item.food;
  el.title = `${item.food} • ${item.count}`;

  const baseFs = 14 + Math.random()*14;
  const baseDur = 9 + Math.random()*8;

  const fs = scale ? scale(item.count, item.food) : baseFs;
  const dur = scale ? (9 + (28 - fs) * 0.4) : baseDur;

  const x = Math.max(8, Math.random()*(cloudWidth-80));
  const dx = (Math.random()*40 - 20) + "px";
  el.style.left = x+'px';
  el.style.bottom = '-20px';
  el.style.fontSize = fs+'px';
  el.style.animationDuration = dur+'s';
  el.style.setProperty('--dx', dx);
  if(item.rank === 1) el.style.fontWeight = '800';

  cloud.appendChild(el);
  setTimeout(()=> el.remove(), dur*1000);
}

async function loadWords(){
  const fallback = ["치킨🍗","라멘🍜","곱창🔥","짜장면","비빔밥","피자🍕","탕수육🥢","막국수","삼겹살🐷","연어"]
    .map((n,i)=>({food:n,count:1,rank:i+1}));

  const url = DATA_URL + `?t=${Date.now()}`; // 중간 캐시 회피
  try{
    let res = await fetchWithTimeout(url, 4000, { cache:'no-store' });
    if(!res.ok) throw new Error(res.status);
    let data = await res.json();
    let items = mapCountsToItems(data);
    if(items.length) return items;

    // 데이터가 비어있으면 한 번만 재시도
    res = await fetchWithTimeout(url, 4000, { cache:'no-store' });
    if(!res.ok) throw new Error(res.status);
    data = await res.json();
    items = mapCountsToItems(data);
    return items.length ? items : fallback;
  }catch{
    return fallback;
  }
}

let WORDS=null, sizeScale=null;
async function initWords(){ WORDS = await loadWords(); sizeScale = makeSizeScaler(WORDS); }

async function seedLoop(){
  if(!WORDS) await initWords();
  const pick = WORDS[Math.floor(Math.random()*WORDS.length)];
  spawn(pick, sizeScale);
  setTimeout(seedLoop, 600 + Math.random()*900);
}
seedLoop();

// --- Email Handling ---
  let userEmail = null;
  const emailInput = document.getElementById('emailInput');
  const emailSubmit = document.getElementById('emailSubmit');
  const emailDisplay = document.getElementById('emailDisplay');
  const emailBtn = document.getElementById('emailBtn');
  
  emailSubmit.addEventListener('click', () => {
    const val = emailInput.value.trim();
    if (!val || !val.includes('@')) {
      alert('올바른 이메일을 입력하세요.');
      return;
    }
    userEmail = val;
    // 입력창 숨기기, 버튼 표시
    emailInput.style.display = 'none';
    emailSubmit.style.display = 'none';
    emailBtn.textContent = val;
    emailDisplay.style.display = 'block';
  });
  
  // 이메일 버튼 눌러 수정 모드로 전환
  emailBtn.addEventListener('click', () => {
    emailDisplay.style.display = 'none';
    emailInput.style.display = 'inline-block';
    emailSubmit.style.display = 'inline-block';
    emailInput.focus();
  });

function addWord(e){
  e.preventDefault();
  
  const uemail = document.getElementById('emailBtn')?.textContent.trim() || "";  
  
  const v = (input.value||"").trim();
  if(!v) return false;
  spawn(v);

  let url = `https://mrdindoin.ddns.net/event/?food=${encodeURIComponent(v)}&email=${encodeURIComponent(uemail)}`;
  
  if (uemail && uemail.includes("@")) {
    url += `&email=${encodeURIComponent(uemail)}`;
  }
  
  fetch(url);
  input.value="";
  input.focus();
  return false;
}

   // --- Close menu on nav-link click + smooth scroll ---
    document.querySelectorAll('#mobileMenu a').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
    
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
    
        if (typeof openMenu === 'function') {
          openMenu(false);
        } else {
          const mobileMenu = document.getElementById('mobileMenu');
          const ovl = document.getElementById('overlay');
          const btn = document.getElementById('menuBtn');
          mobileMenu?.classList.remove('show');
          ovl?.classList.remove('show');
          btn?.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });
    
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (typeof openMenu === 'function') openMenu(false);
        else {
          document.getElementById('mobileMenu')?.classList.remove('show');
          document.getElementById('overlay')?.classList.remove('show');
          document.getElementById('menuBtn')?.setAttribute('aria-expanded','false');
          document.body.style.overflow = '';
        }
      }
    });

window.addEventListener('resize', () => {
  if (window.innerWidth >= 860) {
    if (typeof openMenu === 'function') openMenu(false);
    else {
      document.getElementById('mobileMenu')?.classList.remove('show');
      document.getElementById('overlay')?.classList.remove('show');
      document.getElementById('menuBtn')?.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    }
  }
});

    const NOTICE_URL = "https://mrdindoin.ddns.net/data/notices.json";
    const $feed = document.getElementById('noticeFeed');
    const $skeleton = document.getElementById('noticeSkeleton');
    const $more = document.getElementById('noticeMore');
    const PAGE_SIZE = 6;
    let _notices = [], _page = 0;
    
    function fmtDate(iso){
      try{
        const d = new Date(iso);
        const y = d.getFullYear();
        const m = String(d.getMonth()+1).padStart(2,'0');
        const day = String(d.getDate()).padStart(2,'0');
        return `${y}.${m}.${day}`;
      }catch{ return iso||''; }
    }
    
    function esc(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
    function nl2br(s){ return esc(s).replace(/\n/g, '<br>'); }
    
    function noticeItemHTML(n){
      const hasImg = !!n.image;
      return `
        <article class="card">
          <div class="notice-card">
            ${hasImg ? `<img class="notice-thumb" loading="lazy" src="${esc(n.image)}" alt="">` : `<div class="notice-thumb" aria-hidden="true" style="display:none"></div>`}
            <div>
              <div class="notice-meta">${fmtDate(n.date)}</div>
              <h3 class="notice-title">${esc(n.title)}</h3>
              <div class="notice-body">${nl2br(n.body)}</div>
            </div>
          </div>
        </article>
      `;
    }
    
    function renderPage(){
      const start = _page * PAGE_SIZE;
      const slice = _notices.slice(start, start + PAGE_SIZE);
      if(!slice.length){ $more.style.display = 'none'; return; }
      const html = slice.map(noticeItemHTML).join('');
      $feed.insertAdjacentHTML('beforeend', html);
      _page++;

      $more.style.display = (_page * PAGE_SIZE < _notices.length) ? 'inline-block' : 'none';
    }
    
    async function loadNotices(){
      try{
        $skeleton.style.display = 'grid';
        const res = await fetch(NOTICE_URL, {cache:'no-store', mode:'cors'});
        const data = await res.json();
    
        _notices = (Array.isArray(data) ? data : [])
          .map(n => ({
            title: n.title ?? '',
            body: n.body ?? '',
            date: n.date ?? '',
            image: n.image ?? ''
          }))
          .sort((a,b) => new Date(b.date) - new Date(a.date));
    
        $feed.innerHTML = '';
        _page = 0;
        renderPage();
      }catch(e){
        $feed.innerHTML = `<div class="card"><div class="muted">공지 데이터를 불러오지 못했습니다.</div></div>`;
        console.error('notices load error', e);
      }finally{
        $skeleton.style.display = 'none';
      }
    }
    
    $more.addEventListener('click', renderPage);
    loadNotices();

    // ===== Notice Modal =====
    const modal = document.getElementById('noticeModal');
    const modalImg = document.getElementById('modalImg');
    const modalDate = document.getElementById('modalDate');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.querySelector('.modal-close');
    
    function openModal(notice){
      modalImg.src = notice.image || '';
      modalImg.style.display = notice.image ? 'block' : 'none';
      modalDate.textContent = fmtDate(notice.date);
      modalTitle.textContent = notice.title;
      modalBody.innerHTML = nl2br(notice.body);
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    
    function closeModal(){
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
    
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e)=>{
      if(e.target.classList.contains('modal-backdrop')) closeModal();
    });
    window.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') closeModal();
    });
    
    function attachNoticeEvents(){
      $feed.querySelectorAll('.card').forEach((card, idx)=>{
        card.addEventListener('click', ()=>{
          const n = _notices[idx];
          if(n) openModal(n);
        });
      });
    }
    
    function renderPage(){
      const start = _page * PAGE_SIZE;
      const slice = _notices.slice(start, start + PAGE_SIZE);
      if(!slice.length){ $more.style.display = 'none'; return; }
      const html = slice.map(noticeItemHTML).join('');
      $feed.insertAdjacentHTML('beforeend', html);
      _page++;
      $more.style.display = (_page * PAGE_SIZE < _notices.length) ? 'inline-block' : 'none';
      attachNoticeEvents(); // << 추가
    }

   fetch('https://mrdindoin.ddns.net/data/top_keywords.json')
    .then(r => r.json())
    .then(d => {
      const box = document.getElementById('keywordList');
      box.innerHTML = d.top_keywords.map(k =>
        `<div><b>${k.rank}위</b> ${k.keyword} <span style="color:#999;">(${k.count})</span></div>`
      ).join('');
    });

   // ===== Auto Refresh for Notices =====
    const REFRESH_MS = 120000; // 2분마다 갱신 (원하면 300000=5분)
    let _sig = "";             // 데이터 시그니처(간단 해시)
    let _timer = null;
    
    function signatureOf(arr){
      // 최신 날짜 + 길이 + 앞 3개 제목을 묶어 간단 시그니처
      if(!Array.isArray(arr) || !arr.length) return "empty";
      const latest = arr
        .map(n => new Date(n.date).getTime() || 0)
        .reduce((a,b)=>Math.max(a,b), 0);
      const titles = arr.slice(0,3).map(n => n.title).join("|");
      return `${arr.length}-${latest}-${titles}`;
    }
    
    function toast(msg="새 공지가 업데이트되었습니다"){
      const t = document.getElementById('toast');
      if(!t) return;
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(()=> t.classList.remove('show'), 1800);
    }
    
    async function refreshNotices(){
      try{
        // 새 데이터 가져오기
        const res = await fetch(NOTICE_URL, {cache:'no-store', mode:'cors'});
        const data = await res.json();
        const next = (Array.isArray(data) ? data : [])
          .map(n => ({ title:n.title??'', body:n.body??'', date:n.date??'', image:n.image??'' }))
          .sort((a,b)=> new Date(b.date) - new Date(a.date));
    
        const nextSig = signatureOf(next);
        if(nextSig !== _sig){
          // 갱신 발생 → 상태 교체 & 리렌더
          _notices = next;
          _sig = nextSig;
          $feed.innerHTML = '';
          _page = 0;
          renderPage();
          toast();
        }
      }catch(e){
        // 조용히 무시(네트워크 이슈 등), 연속 오류 시 백오프 원하면 여기서 처리
        // console.warn('refresh error', e);
      }
    }
    
    function startNoticeAutoRefresh(){
      // 초기 시그니처 설정
      _sig = signatureOf(_notices);
      stopNoticeAutoRefresh();
      _timer = setInterval(refreshNotices, REFRESH_MS);
    }
    
    function stopNoticeAutoRefresh(){
      if(_timer){ clearInterval(_timer); _timer = null; }
    }
    
    // 탭 비활성화 시 정지, 다시 활성화 시 즉시 갱신 + 타이머 재가동
    document.addEventListener('visibilitychange', ()=>{
      if(document.hidden){ stopNoticeAutoRefresh(); }
      else { refreshNotices(); startNoticeAutoRefresh(); }
    });
    
    // 초기 로딩 직후 자동 갱신 시작
    // (loadNotices() 내부에서 renderPage()가 끝난 뒤 호출)
    const _origLoadNotices = loadNotices;
    loadNotices = async function(){
      await _origLoadNotices();
      startNoticeAutoRefresh();
    };
    
    // 페이지 첫 로딩 시 loadNotices가 이미 호출되었다면,
    // 아래 한 줄로도 시작 가능 (중복 시작 방지 위해 존재 체크)
    if(typeof _notices !== 'undefined' && _notices.length >= 0 && !_timer){
      startNoticeAutoRefresh();
    } 
  



  /* ===== TOP Keywords loader (daily/weekly/monthly) ===== */
  (function(){
    const root = document.getElementById('top-keywords');
    if (!root) return; // 섹션이 없으면 조용히 종료
  
    const ENDPOINTS = {
      daily:   'https://mrdindoin.ddns.net/data/top/daily.json',
      weekly:  'https://mrdindoin.ddns.net/data/top/weekly.json',
      monthly: 'https://mrdindoin.ddns.net/data/top/monthly.json'
    };
  
    const list = document.getElementById('topList');
    const upd  = document.getElementById('topUpdated');
    const tabs = root.querySelectorAll('.tab');
  
    async function fetchJSON(url){
      const r = await fetch(url, { cache: 'no-cache' });
      if (!r.ok) throw new Error('fetch fail: '+url);
      return r.json();
    }
  
    function render(data){
      const rows = (data.top||[]).slice(0,3).map((t,i)=>{
        const cls = i===0 ? "gold" : i===1 ? "silver" : "bronze";
        return `
          <li class="wk-item ${cls}">
            <span class="wk-rank">${i+1}</span>
            <div class="wk-body">
              <div class="wk-word">${t.keyword}</div>
              <div class="wk-meta">
                <span class="wk-count">${t.count}</span>
              </div>
            </div>
          </li>`;
      }).join('');
      list.innerHTML = rows || '<li class="wk-item"><div class="wk-body">데이터가 없습니다</div></li>';
      upd.textContent = data.updated || '';
    }
  
    async function load(kind){
      tabs.forEach(b=>{
        const on = b.dataset.kind === kind;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      try { render(await fetchJSON(ENDPOINTS[kind])); }
      catch(e){ console.error(e); render({top:[]}); }
    }
  
    tabs.forEach(b => b.addEventListener('click', ()=> load(b.dataset.kind)));
    load('weekly'); // 초기 탭
  })();




function toggleNav(){
		const nav = document.querySelector('.nav-menu');
		nav.classList.toggle('nav-open');
	}

	// 모바일에서 메뉴 클릭하면 자동으로 닫히게
	document.addEventListener('DOMContentLoaded', () => {
	const nav = document.querySelector('.nav-menu');
	if(!nav) return;
		nav.querySelectorAll('a').forEach(a => {
			a.addEventListener('click', () => {
				nav.classList.remove('nav-open');
			});
		});
	});





addEventListener('resize', ()=> { cloudWidth = cloud.clientWidth; });



document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('historyGrid');
  if (!grid) return;

  fetch('https://mrdindoin.ddns.net/data/gallery.json')
    .then(r => r.json())
    .then(items => {
      items.sort((a,b) => (b.date || '').localeCompare(a.date || ''));

      grid.innerHTML = items.map(item => {
        const tags = (item.tags || []).map(t => `<span class="hg-tag">#${t}</span>`).join('');
        return `
          <article class="card hg-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.title}" class="hg-thumb">
            <div class="hg-body">
              <h3 class="hg-title">${item.title}</h3>
              <p class="hg-text">${item.text}</p>
              <div class="hg-meta">
                <span class="hg-date">${item.date || ''}</span>
                <span class="hg-tags">${tags}</span>
              </div>
            </div>
          </article>
        `;
      }).join('');
    })
    .catch(() => {
      grid.innerHTML = `<p class="muted" style="font-size:13px;">아직 기록된 활동이 없습니다.</p>`;
    });
});


document.addEventListener("click", function(e){
  const item = e.target.closest(".pg-item");
  if(!item) return;

  const full = item.dataset.full;
  if(!full) return;

  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("imgModalImg");

  modalImg.src = full;
  modal.style.display = "flex";
});

document.getElementById("imgModalClose")
  .addEventListener("click", ()=> {
    document.getElementById("imgModal").style.display = "none";
  });

document.getElementById("imgModal")
  .addEventListener("click", (e)=> {
    if(e.target.id === "imgModal") {
      e.target.style.display = "none";
    }
  });
