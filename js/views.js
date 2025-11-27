// --- nav ---
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
