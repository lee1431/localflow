document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('joinForm');
  const input = document.getElementById('emailInput');
  const toast = document.getElementById('joinToast');

  if (!form || !input) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();

    const email = (input.value || "").trim();
    if (!email) return;

    // ✅ 네이버 + 다음 메일만 허용: naver.com, daum.net, hanmail.net
    const allowed = /^[0-9a-zA-Z._%+-]+@(naver\.com|daum\.net|hanmail\.net)$/i;
    if (!allowed.test(email)) {
      const msg = '네이버(@naver.com) 또는 다음(@daum.net, @hanmail.net) 메일만 등록할 수 있습니다.';
      if (toast) {
        toast.textContent = msg;
        toast.style.display = 'block';
        setTimeout(()=>{ toast.style.display = 'none'; }, 3500);
      } else {
        alert(msg);
      }
      return;
    }

    const url = `https://mrdindoin.ddns.net/event/join?email=${encodeURIComponent(email)}`;

    fetch(url)
      .catch(() => {})
      .finally(() => {
        if (toast) {
          toast.textContent = '참여가 등록되었습니다.';
          toast.style.display = 'block';
          setTimeout(() => { toast.style.display = 'none'; }, 3500);
        }
        input.value = "";
      });
  });
});
