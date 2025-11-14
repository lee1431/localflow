document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('joinForm');
  const input = document.getElementById('emailInput');
  const toast = document.getElementById('joinToast');

  if (!form || !input) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();

    const email = (input.value || "").trim();
    if (!email) return;

    const naverOnly = /^[0-9a-zA-Z._%+-]+@naver\.com$/i;
    if (!naverOnly.test(email)) {
      if (toast) {
        toast.textContent = '네이버 메일(@naver.com)만 등록할 수 있습니다.';
        toast.style.display = 'block';
        setTimeout(()=>{ toast.style.display = 'none'; }, 3500);
      } else {
        alert('네이버 메일(@naver.com)만 등록할 수 있습니다.');
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
