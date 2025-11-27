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

// --- Get Uniq Today Count ---
fetch('https://mrdindoin.ddns.net/data/views.json', {cache:'no-store'})
  .then(r=>r.json())
  .then(d=>{
    document.getElementById('viewTotal').textContent = d.total;
    document.getElementById('viewToday').textContent = d.today;
});
