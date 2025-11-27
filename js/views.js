fetch('https://mrdindoin.ddns.net/data/views.json', {cache:'no-store'})
  .then(r=>r.json())
  .then(d=>{
    document.getElementById('viewTotal').textContent = d.total;
    document.getElementById('viewToday').textContent = d.today;
});
