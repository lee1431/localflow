function scrollToSection(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.scrollIntoView({behavior:'smooth', block:'start'});
}

document.getElementById('joinForm').addEventListener('submit', function(e){
e.preventDefault();
const email = document.getElementById('emailInput').value.trim();
if(!email) return;

const url = `https://mrdindoin.ddns.net/event/join?email=${encodeURIComponent(email)}`;
fetch(url)
  .catch(()=>{})
  .finally(()=>{
    const toast = document.getElementById('joinToast');
    toast.style.display = 'block';
    setTimeout(()=>{ toast.style.display = 'none'; }, 3500);
    document.getElementById('emailInput').value = "";
  });
});
