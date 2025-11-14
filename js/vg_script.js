document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('historyGrid');
  if (!grid) return;

  fetch('https://mrdindoin.ddns.net/data/gallery.json')
    .then(r => r.json())
    .then(items => {
      items.sort((a,b) => (b.date || '').localeCompare(a.date || ''));

      grid.innerHTML = items.map(item => {
        const tags = (item.tags || []).map(t => `<span class="hg-tag">#${t}</span>`).join('');
        return `
          <article class="card hg-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.title}" class="hg-thumb">
            <div class="hg-body">
              <h3 class="hg-title">${item.title}</h3>
              <p class="hg-text">${item.text}</p>
              <div class="hg-meta">
                <span class="hg-date">${item.date || ''}</span>
                <span class="hg-tags">${tags}</span>
              </div>
            </div>
          </article>
        `;
      }).join('');
    })
    .catch(() => {
      grid.innerHTML = `<p class="muted" style="font-size:13px;">아직 기록된 활동이 없습니다.</p>`;
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
