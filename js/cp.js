// ====== Config ======
const API_COUPONS = "https://mrdindoin.ddns.net/upzoo/api/coupons";
const API_STATS   = "https://mrdindoin.ddns.net/event/stats.json";
const API_JOIN    = "https://mrdindoin.ddns.net/event/join";

// 로그용 프록시(동일 도메인으로 붙여두면 CORS 문제 덜남)
const PROXY_LOG   = "/proxy/coupon";

// ====== State ======
let countdownTimer = null;
let statsTimer = null;

// ====== Utils ======
function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

// ====== Progress UI ======
function ensureProgressUI(card){
  let wrap = card.querySelector(".coupon-progress-wrap");
  if (wrap) return wrap;

  wrap = document.createElement("div");
  wrap.className = "coupon-progress-wrap";
  wrap.innerHTML = `
    <div class="coupon-progress-top">
      <span class="appl-count">응모 <b class="appl-now">0</b>/<b class="appl-cap">0</b></span>
      <span class="appl-percent">0%</span>
    </div>
    <div class="coupon-progress-bar">
      <div class="coupon-progress-fill" style="width:0%"></div>
    </div>
  `;

  const bottom = card.querySelector(".coupon-bottom");
  if (bottom) bottom.parentNode.insertBefore(wrap, bottom);
  else card.appendChild(wrap);

  return wrap;
}

function applyProgressToCard(card, info){
  const wrap = ensureProgressUI(card);
  const nowEl = wrap.querySelector(".appl-now");
  const capEl = wrap.querySelector(".appl-cap");
  const pctEl = wrap.querySelector(".appl-percent");
  const fill  = wrap.querySelector(".coupon-progress-fill");

  const now = Number(info?.applicants ?? 0);
  const cap = Number(info?.capacity ?? 0);
  const pct = cap > 0 ? Math.max(0, Math.min(100, Math.round((now / cap) * 100))) : 0;

  nowEl.textContent = now.toLocaleString();
  capEl.textContent = cap.toLocaleString();
  pctEl.textContent = pct + "%";
  fill.style.width = pct + "%";

  if (cap > 0 && now >= cap){
    card.classList.add("coupon-full");
  } else {
    card.classList.remove("coupon-full");
  }
}

// ====== Countdown ======
function startCountdowns() {
  if (countdownTimer) clearInterval(countdownTimer);

  function update() {
    const now = Date.now();
    document.querySelectorAll('.coupon-card').forEach(card => {
      const deadlineStr = card.dataset.deadline;
      const textEl = card.querySelector('.coupon-countdown-text');
      if (!deadlineStr || !textEl) return;

      const end = new Date(deadlineStr).getTime();
      const diff = end - now;

      if (diff <= 0) {
        textEl.textContent = '마감';
        card.classList.add('coupon-expired');
        return;
      }

      const sec = Math.floor(diff / 1000);
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;

      textEl.textContent = (d > 0)
        ? `${d}일 ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
        : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    });
  }

  update();
  countdownTimer = setInterval(update, 1000);
}

// ====== Stats Polling ======
async function refreshCouponStats(){
  try{
    const res = await fetch(API_COUPONS + "?ts=" + Date.now(), { cache: "no-store" });
    const j = await res.json();               // ✅ text+JSON.parse 필요 없음

    const list = j.coupons || [];

    // id -> coupon 맵으로 변환
    const byId = Object.create(null);
    list.forEach(c => { if (c && c.id) byId[c.id] = c; });

    document.querySelectorAll(".coupon-card").forEach(card => {
      const id = card.dataset.couponId;
      if (!id) return;

      const coupon = byId[id];
      if (!coupon) return;                    // ✅ 못 찾으면 덮어쓰지 말기

      // ✅ capacity는 coupon.capacity, applicants는 coupon.applicants (없으면 0)
      applyProgressToCard(card, {
        applicants: coupon.applicants ?? 0,
        capacity: coupon.capacity ?? Number(card.dataset.capacity ?? 0)
      });
    });
  }catch(e){
    console.error("stats fetch failed", e);
  }
}

function startStatsPolling(){
  if (statsTimer) clearInterval(statsTimer);
  refreshCouponStats();
  statsTimer = setInterval(refreshCouponStats, 15000);
}

// ====== Modal ======
function openCouponModal(couponName, couponId){
  const modal = document.getElementById("couponModal");
  document.getElementById("couponModalTitle").textContent = couponName;
  document.getElementById("couponSuccessMsg").style.display = "none";
  document.getElementById("couponEmail").value = "";
  modal.dataset.couponId = couponId || "";
  modal.dataset.couponName = couponName || "";
  modal.style.display = "flex";
}

function closeCouponModal(){
  const modal = document.getElementById("couponModal");
  modal.style.display = "none";

  // 버튼 원상복구
  const btn = document.getElementById("couponSubmitBtn");
  btn.textContent = "응모하기";
  btn.onclick = submitCouponEmail;
}

function submitCouponEmail(){
  const email = document.getElementById("couponEmail").value.trim();
  const msg   = document.getElementById("couponSuccessMsg");
  const btn   = document.getElementById("couponSubmitBtn");
  const modal = document.getElementById("couponModal");

  const couponName = (modal.dataset.couponName || "").trim();
  const couponId   = (modal.dataset.couponId || "").trim();

  if (!email) { alert("이메일을 입력해주세요!"); return; }

  const naverOnly = /^[a-zA-Z0-9._%+-]+@naver\.com$/;
  if (!naverOnly.test(email)) {
    alert("네이버 메일(@naver.com)만 응모할 수 있습니다.");
    return;
  }

  const now = encodeURIComponent(new Date().toISOString());

  // ====== (1) 응모 접수 ======
  const url = `${API_JOIN}?coupon=${encodeURIComponent(couponName)}&email=${encodeURIComponent(email)}&time=${now}`;

  fetch(url, { cache:"no-store" })
    .then(res => res.text())
    .then(_ => {
      msg.textContent = "🎉 응모가 접수되었습니다!";
      msg.style.display = "block";

      // ====== (2) 로그용 프록시 콜 (쿠폰ID 기반) ======
      // 실패해도 사용자 경험에 영향없게 별도 처리
      if (couponId){
        fetch(`${PROXY_LOG}?coupon_id=${encodeURIComponent(couponId)}`, { method:"GET", cache:"no-store" })
          .catch(console.error);
      }

      // ====== (3) 버튼을 닫기로 ======
      btn.textContent = "닫기";
      btn.onclick = closeCouponModal;

      // ====== (4) stats 즉시 리프레시 ======
      refreshCouponStats();
    })
    .catch(err => {
      alert("서버 요청 중 오류가 발생했습니다.");
      console.error(err);
    });
}

// ====== Button Binding ======
function bindCouponButtons(){
  document.querySelectorAll(".coupon-apply-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const title = btn.dataset.couponTitle || "";
      const id = btn.dataset.couponId || "";
      openCouponModal(title, id);

      // (옵션) 모달 열릴 때도 로그 남기고 싶으면 여기서도 가능
      // fetch(`${PROXY_LOG}?coupon_id=${encodeURIComponent(id)}&action=open`, { cache:"no-store" }).catch(()=>{});
    });
  });
}

// ====== Load Coupons ======
async function loadCoupons(){
  const grid = document.getElementById("couponGrid");
  const errEl = document.getElementById("couponError");
  errEl.style.display = "none";
  grid.innerHTML = "";

  try{
    const res = await fetch(API_COUPONS, { cache:"no-store" });
    if (!res.ok) throw new Error("쿠폰 불러오기 실패");

    const data = await res.json();
    const coupons = data.coupons || [];

    coupons.forEach(coupon => {
      const article = document.createElement("article");
      article.className = "coupon-card";
      article.dataset.deadline = coupon.deadline || "";
      article.dataset.couponId = coupon.id || "";
      article.dataset.couponTitle = coupon.title || "";
      article.dataset.capacity = coupon.capacity || 0;

      article.innerHTML = `
        <div class="coupon-media">
          <img src="${escapeHtml(coupon.image)}" alt="${escapeHtml(coupon.title)}" />
          <div class="coupon-store-tag">${escapeHtml(coupon.shop_name)}</div>
          <div class="coupon-stock-tag">잔량 <span>${escapeHtml(coupon.stock_remaining)}개</span></div>
          <div class="coupon-title-wrap"><h3>${escapeHtml(coupon.title)}</h3></div>
          <div class="coupon-countdown">추첨까지 
            <span class="coupon-countdown-text">--:--:--</span>
          </div>
        </div>

        <div class="coupon-bottom">
          <button
            type="button"
            class="coupon-apply-btn"
            data-coupon-id="${escapeHtml(coupon.id)}"
            data-coupon-title="${escapeHtml(coupon.title)}"
          >
            쿠폰 응모하기
          </button>
        </div>
      `;

      grid.appendChild(article);
      ensureProgressUI(article); // UI 미리 꽂아두기
    });

    bindCouponButtons();
    startCountdowns();
    startStatsPolling();

  }catch(e){
    console.error(e);
    errEl.style.display = "block";
  }
}

// ====== Wire Modal Buttons ======
document.getElementById("couponCancelBtn").addEventListener("click", closeCouponModal);
document.getElementById("couponSubmitBtn").addEventListener("click", submitCouponEmail);

// ESC로 닫기 / 바깥 클릭 닫기
document.getElementById("couponModal").addEventListener("click", (e)=>{
  if (e.target.id === "couponModal") closeCouponModal();
});
document.addEventListener("keydown", (e)=>{
  if (e.key === "Escape") closeCouponModal();
});

document.addEventListener("DOMContentLoaded", loadCoupons);
