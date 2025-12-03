function initCouponCountdown(){
    const cards = document.querySelectorAll('.coupon-card');
    if (!cards.length) return;

    function tick(){
      const now = Date.now();

      cards.forEach(card => {
        const deadlineStr = card.getAttribute('data-deadline');
        const out = card.querySelector('.coupon-countdown-text');
        if (!deadlineStr || !out) return;

        const end = new Date(deadlineStr).getTime();
        let diff = Math.max(0, end - now);

        if (diff <= 0){
          out.textContent = '마감';
          card.classList.add('coupon-closed');
          return;
        }

        const sec = Math.floor(diff / 1000);
        const d = Math.floor(sec / 86400);
        const h = Math.floor((sec % 86400) / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;

        if (d > 0){
          out.textContent =
            d + '일 ' +
            String(h).padStart(2,'0') + ':' +
            String(m).padStart(2,'0') + ':' +
            String(s).padStart(2,'0');
        } else {
          out.textContent =
            String(h).padStart(2,'0') + ':' +
            String(m).padStart(2,'0') + ':' +
            String(s).padStart(2,'0');
        }
      });
    }

    tick();
    setInterval(tick, 1000);
  }

  document.addEventListener('DOMContentLoaded', initCouponCountdown);
  
  function openCouponModal(couponName){
    document.getElementById("couponModalTitle").textContent = couponName;
    document.getElementById("couponModal").style.display = "block";
    document.getElementById("couponSuccessMsg").style.display = "none";
  }

  function closeCouponModal(){
    document.getElementById("couponModal").style.display = "none";
    document.getElementById("couponEmail").value = "";
  }

  function submitCouponEmail(){
	  const email = document.getElementById("couponEmail").value.trim();
	  const msg = document.getElementById("couponSuccessMsg");
	  const couponName = document.getElementById("couponModalTitle").value.trim();
	
	  if (!email){
	    alert("이메일을 입력해주세요!");
	    return;
	  }
	
	  const naverOnly = /^[a-zA-Z0-9._%+-]+@naver\.com$/;
	  if (!naverOnly.test(email)) {
	    alert("네이버 메일(@naver.com)만 응모할 수 있습니다.");
	    return;
	  }
	
	  if (!couponName){
	    alert("쿠폰명이 비어있습니다.");
	    return;
	  }
	
	  const ts = new Date().toISOString();
	
	  const url = `https://mrdindoin.ddns.net/event/join?couponName=${encodeURIComponent(couponName)}&email=${encodeURIComponent(email)}&ts=${encodeURIComponent(ts)}`;
	
	  console.log("📡 GET 요청:", url);
	
	  fetch(url, {
	    method: "GET"
	  })
	  .then(res => res.text())
	  .then(data => {
	    console.log("서버 응답:", data);
	
	    msg.textContent = "🎉 응모가 접수되었습니다!";
	    msg.style.display = "block";
	  })
	  .catch(err => {
	    console.error("Fetch 오류:", err);
	    msg.textContent = "⚠️ 서버 요청에 실패했습니다.";
	    msg.style.display = "block";
	  });
	}
