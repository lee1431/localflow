async function loadCoupons() {
  try {
    const res = await fetch('https://mrdindoin.ddns.net/upzoo/api/coupons', { cache: 'no-store' });
    if (!res.ok) throw new Error('쿠폰 불러오기 실패');

    const data = await res.json();
    const listEl = document.getElementById('coupon-list');
    listEl.innerHTML = '';

    (data.coupons || []).forEach(coupon => {
      const article = document.createElement('article');
      article.className = 'coupon-card';
      article.dataset.deadline = coupon.deadline || '';

      article.innerHTML = `
        <div class="coupon-media">
          <img src="${coupon.image}" alt="${coupon.title}" />
          <div class="coupon-store-tag">${coupon.store}</div>
          <div class="coupon-stock-tag">잔량 <span>${coupon.stock}개</span></div>
          <div class="coupon-title-wrap"><h3>${coupon.title}</h3></div>
          <div class="coupon-countdown">
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

      listEl.appendChild(article);
    });

    bindCouponButtons();
    initCountdowns();
  } catch (err) {
    console.error(err);
    const listEl = document.getElementById('coupon-list');
    listEl.innerHTML = '<p class="coupon-error">쿠폰을 불러오지 못했습니다.</p>';
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

      const sec = Math.floor(diff / 1000) % 60;
      const min = Math.floor(diff / (1000 * 60)) % 60;
      const hr  = Math.floor(diff / (1000 * 60 * 60));

      textEl.textContent =
        String(hr).padStart(2, '0') + ':' +
        String(min).padStart(2, '0') + ':' +
        String(sec).padStart(2, '0');
    });
  }

  update();
  setInterval(update, 1000);
}

document.addEventListener('DOMContentLoaded', loadCoupons);
