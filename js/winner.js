const API = {
  applicants: "https://mrdindoin.ddns.net/data/applicants.json",
  check:      "https://mrdindoin.ddns.net/event/check",
  prizes:     "https://mrdindoin.ddns.net/data/prizes.json",
  reviews:    "https://mrdindoin.ddns.net/data/reviews.json"
};

const $ = s=>document.querySelector(s);


const API_APPLICANTS = "https://mrdindoin.ddns.net/winner/applicants";

const applTbody  = document.getElementById("applTbody");
const listSearch = document.getElementById("listSearch");
const listFilter = document.getElementById("listFilter");
const btnReset   = document.getElementById("btnReset");
const btnPrev    = document.getElementById("btnPrev");
const btnNext    = document.getElementById("btnNext");
const applInfo   = document.getElementById("applInfo");

const applState = { page: 1, size: 20, q: "", f: "" };

function setLoading(){
  applTbody.innerHTML = `<tr><td colspan="4" class="muted">불러오는 중…</td></tr>`;
}

async function fetchApplicants(){
  setLoading();
  const params = new URLSearchParams({ page: applState.page, size: applState.size });
  if (applState.q) params.set("q", applState.q);
  if (applState.f) params.set("f", applState.f);

  const url = `${API_APPLICANTS}?${params.toString()}`;
  try{
    const r = await fetch(url, { cache:"no-store" });
    const ct = r.headers.get("content-type") || "";
    const raw = await r.text();

    console.log("[APPLICANTS]", r.status, ct, raw.slice(0,200));

    if (!r.ok) throw new Error(r.status);

    let j;
    if (ct.includes("application/json")) {
      j = JSON.parse(raw);
    } else {

      throw new Error(`Not JSON: ${raw.slice(0,80)}`);
    }
    renderApplicants(j);
  }catch(e){
    applTbody.innerHTML =
      `<tr><td colspan="4" class="muted">목록을 불러오지 못했습니다 ${e?.message?`(${e.message})`:""}.</td></tr>`;
    applInfo.textContent = "-";
    btnPrev.disabled = btnNext.disabled = true;
  }
}

function renderApplicants(j){
  // rows
  const rows = (j.items||[]).map(a=>{
    const st = a.win ? `<span class="status-pill win">당첨</span>`
                     : `<span class="status-pill ok">응모</span>`;
    return `<tr>
      <td>${escapeHtml(a.email||"")}</td>
      <td>${escapeHtml(a.date||"-")}</td>
      <td>${st}</td>
    </tr>`;
  }).join("");

  applTbody.innerHTML = rows || `<tr><td colspan="4" class="muted">검색 결과가 없습니다.</td></tr>`;

  // pager
  applInfo.textContent = `총 ${j.total?.toLocaleString?.()||0}명 · ${j.page}/${j.pages||1} 페이지`;
  btnPrev.disabled = (j.page <= 1);
  btnNext.disabled = !j.has_next;
  btnPrev.onclick  = ()=>{ if(j.page>1){ applState.page = j.page-1; fetchApplicants(); window.scrollTo({top:0,behavior:"smooth"});} };
  btnNext.onclick  = ()=>{ if(j.has_next){ applState.page = j.page+1; fetchApplicants(); window.scrollTo({top:0,behavior:"smooth"});} };
}

if (listSearch) listSearch.addEventListener("input", debounce(()=>{
  applState.q = (listSearch.value||"").trim();
  applState.page = 1;
  fetchApplicants();
}, 250));

if (listFilter) listFilter.addEventListener("change", ()=>{
  applState.f = listFilter.value || "";
  applState.page = 1;
  fetchApplicants();
});

if (btnReset) btnReset.onclick = ()=>{
  if (listSearch) listSearch.value = "";
  if (listFilter) listFilter.value = "";
  applState.q = ""; applState.f = ""; applState.page = 1;
  fetchApplicants();
};

function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])); }
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

fetchApplicants();

  

/* ---------- 2) 상품 종류 및 재고 ---------- */
const prizeGrid = $("#prizeGrid");
async function loadPrizes(){
  prizeGrid.innerHTML = "";
  try{
    const r = await fetch(API.prizes, {cache:"no-store"});
    const j = r.ok ? await r.json() : {items:[]};
    (j.items||[]).forEach(p=>{
      const img = p.img ? `<img src="${encodeURI(p.img)}" loading="lazy" alt="${escapeHtml(p.name)}">`
                        : `<span class="muted">No Image</span>`;
      prizeGrid.insertAdjacentHTML("beforeend", `
        <article class="prize">
          <div class="thumb">${img}</div>
          <div class="meta">
            <div><strong>${escapeHtml(p.name)}</strong><div class="stock">재고 <strong>${p.stock??"-"}</strong></div></div>
            ${p.brand?`<span class="pill">${escapeHtml(p.brand)}</span>`:""}
          </div>
        </article>
      `);
    });
  }catch(e){
    prizeGrid.innerHTML = `<div class="card muted">상품 정보를 불러오지 못했습니다.</div>`;
  }
}

/* ---------- 3) 당첨자 후기 ---------- */
const revGrid = $("#revGrid");
const modal = $("#modal"), mImg=$("#mImg"), mTitle=$("#mTitle"), mText=$("#mText"), mMeta=$("#mMeta");
$("#mClose").onclick = ()=> modal.classList.remove("show");
modal.addEventListener("click", e=>{ if(e.target===modal) modal.classList.remove("show"); });

async function loadReviews(){
  revGrid.innerHTML = "";
  try{
    const r = await fetch(API.reviews, {cache:"no-store"});
    const arr = r.ok ? await r.json() : [];
    if(!arr.length){
      revGrid.innerHTML = `<div class="card muted">아직 후기가 없습니다.</div>`;
      return;
    }
    arr.forEach(v=>{
      const t = v.thumb || v.img;
      revGrid.insertAdjacentHTML("beforeend", `
        <article class="rev">
          <div class="thumb">
            <img src="${encodeURI(t)}" loading="lazy" alt="${escapeHtml(v.title||'후기 이미지')}"
                 onclick="openReview('${encodeURIComponent(v.img)}','${escapeHtmlJS(v.title||"후기")}','${escapeHtmlJS(v.by||"-")}','${escapeHtmlJS(v.date||"")}','${escapeHtmlJS(v.text||"")}')">
          </div>
          <div class="body">
            <div class="meta"><span>${escapeHtml(v.title||"후기")}</span><span>${escapeHtml(v.date||"")}</span></div>
            <div class="muted" style="font-size:12px">${escapeHtml(v.by||"")}</div>
          </div>
        </article>
      `);
    });
  }catch(e){
    revGrid.innerHTML = `<div class="card muted">후기를 불러오지 못했습니다.</div>`;
  }
}

window.openReview = (imgUrlEnc, title, by, date, text)=>{
  mImg.src = decodeURIComponent(imgUrlEnc);
  mTitle.textContent = title;
  mMeta.textContent = `${by||""} ${date?(" · "+date):""}`;
  mText.textContent = text||"";
  modal.classList.add("show");
};

/* ---------- utils ---------- */
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])); }
function escapeHtmlJS(s){ return escapeHtml(s).replace(/\n/g," "); }
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

/* ---------- init ---------- */

loadPrizes();
loadReviews();
