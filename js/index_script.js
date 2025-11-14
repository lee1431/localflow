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

document.addEventListener("click", function(e){
  const item = e.target.closest(".pg-item");
  if(!item) return;

  const full = item.dataset.full;
  if(!full) return;

  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("imgModalImg");

  modalImg.src = full;
  modal.style.display = "flex";
});

document.getElementById("imgModalClose")
  .addEventListener("click", ()=> {
    document.getElementById("imgModal").style.display = "none";
  });

document.getElementById("imgModal")
  .addEventListener("click", (e)=> {
    if(e.target.id === "imgModal") {
      e.target.style.display = "none";
    }
  });

fetch('https://mrdindoin.ddns.net/data/partner_gallery.json')
  .then(r => r.json())
  .then(list => {
    const box = document.getElementById('pgGrid');
    box.innerHTML = list.slice(0, 4).map(item => `
      <figure class="pg-item" data-full="${item.full}">
        <img src="${item.thumb}" alt="${item.title}">
        <figcaption>${item.title}</figcaption>
      </figure>
    `).join('');
  });
