async function loadCoupons() {
  try {
    const res = await fetch('https://mrdindoin.ddns.net/upzoo/api/coupons', { cache: 'no-store' });
    if (!res.ok) throw new Error('쿠폰 불러오기 실패');

    const data = await res.json();
    const listEl = document.querySelector('.coupon-list'); 
    listEl.innerHTML = '';   // 기존 내용 싹 지우기

    const wrap = document.createElement('div');
    wrap.className = 'wrap';

    const title = document.createElement('h2');
    title.textContent = 'LocalFlow 쿠폰';
    wrap.appendChild(title);
    const coupongrid = document.createElement('div');
    coupongrid.className = 'coupon-grid';

    (data.coupons || []).forEach(coupon => {
      const article = document.createElement('article');
      article.className = 'coupon-card';
      article.dataset.deadline = coupon.deadline || '';

      article.innerHTML = `
        <div class="coupon-media">
          <img src="${coupon.image}" alt="${coupon.title}" />
          <div class="coupon-store-tag">${coupon.shop_name}</div>
          <div class="coupon-stock-tag">잔량 <span>${coupon.stock_remaining}개</span></div>
          <div class="coupon-title-wrap"><h3>${coupon.title}</h3></div>
          <div class="coupon-countdown">추첨까지 
             <span class="coupon-countdown-text">--:--:--</span>
          </div>
        </div>
        <div class="coupon-bottom">
          <button
            type="button"
            class="coupon-apply-btn"
            data-coupon-id="${coupon.id}"
            data-coupon-title="${coupon.title}"
          >
            쿠폰 응모하기
          </button>
        </div>
      `;

      coupongrid.appendChild(article);
    });
    wrap.appendChild(coupongrid);

    listEl.appendChild(wrap);

    bindCouponButtons();
    initCountdowns();

  } catch (err) {
    console.error(err);
    const listEl = document.querySelector('.coupon-list');
    listEl.innerHTML = '<p class="coupon-error">쿠폰을 불러오지 못했습니다.</p>';
  }
}



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
	
	  // 버튼 바로 위에 꽂기 (coupon-bottom 앞에 삽입)
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
	
	  // 꽉 찼으면 카드에 클래스(버튼 disable 같은거)
	  if (cap > 0 && now >= cap){
	    card.classList.add("coupon-full");
	  } else {
	    card.classList.remove("coupon-full");
	  }
	}




function bindCouponButtons() {
  document.querySelectorAll('.coupon-apply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.dataset.couponTitle;
      const id = btn.dataset.couponId;

      // 기존 openCouponModal 재활용
      if (typeof openCouponModal === 'function') {
        openCouponModal(title, id);
      }

      // 여기서 프록시 구멍으로 응모로그 쏴버리기 (형님 계획 반영)
      fetch(`/proxy/coupon?coupon_id=${encodeURIComponent(id)}`, {
        method: 'GET',
        cache: 'no-store'
      }).catch(console.error);
    });
  });
}

function initCountdowns() {
  const cards = document.querySelectorAll('.coupon-card');

  function update() {
    const now = new Date().getTime();

    cards.forEach(card => {
      const deadlineStr = card.dataset.deadline;
      const textEl = card.querySelector('.coupon-countdown-text');
      if (!deadlineStr || !textEl) return;

      const deadline = new Date(deadlineStr).getTime();
      const diff = deadline - now;

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

      if (d > 0){
        textEl.textContent =
          d + '일 ' +
          String(h).padStart(2,'0') + ':' +
          String(m).padStart(2,'0') + ':' +
          String(s).padStart(2,'0');
      } else {
        textEl.textContent =
          String(h).padStart(2,'0') + ':' +
          String(m).padStart(2,'0') + ':' +
          String(s).padStart(2,'0');
      }

      
    });
  }

  update();
  setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', loadCoupons);
