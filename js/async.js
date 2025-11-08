(async function loadWeeklyKeywords(){
  const URL = 'https://mrdindoin.ddns.net/data/top_keywords.json';           // JSON 경로

  const root   = document.querySelector('.weekly-keywords');
  const listEl = root.querySelector('.wk-list');
  const timeEl = root.querySelector('.wk-updated');

  // 유틸: 주간 변동 배지
  function trend(delta){
    if (delta === undefined || delta === null) return {txt:'–', cls:'same'};
    if (+delta > 0)  return {txt:`▲${Math.abs(delta)}`, cls:'up'};
    if (+delta < 0)  return {txt:`▼${Math.abs(delta)}`, cls:'down'};
    return {txt:'–', cls:'same'};
  }
  // 유틸: 순위별 클래스
  function rankClass(rank){
    return rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
  }
  // 유틸: 시간 표기
  function formatKST(iso){
    if (!iso) return '';
    const d = new Date(iso);
    // 사용 환경이 KST면 자동 변환, 아니면 로컬타임
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    return `${y}-${m}-${day} ${hh}:${mm}`;
  }

  // 로딩 표시 (선택)
  listEl.innerHTML = `
    <li class="wk-item loading"><span class="wk-rank">1</span><div class="wk-body"><div class="wk-word"> </div><div class="wk-meta"><span class="wk-count"> </span></div></div></li>
    <li class="wk-item loading"><span class="wk-rank">2</span><div class="wk-body"><div class="wk-word"> </div><div class="wk-meta"><span class="wk-count"> </span></div></div></li>
    <li class="wk-item loading"><span class="wk-rank">3</span><div class="wk-body"><div class="wk-word"> </div><div class="wk-meta"><span class="wk-count"> </span></div></div></li>
  `;

  try{
    const res = await fetch(URL, {cache:'no-store'});
    if(!res.ok) throw new Error('fetch failed');
    const data = await res.json();

    // 시간 업데이트
    timeEl.textContent = formatKST(data.updated_at || new Date().toISOString());

    // 리스트 렌더링
    listEl.innerHTML = '';
    (data.top_keywords || []).slice(0,3).forEach((item, idx) => {
      const r   = item.rank ?? (idx+1);
      const cls = rankClass(r);
      const td  = trend(item.delta);

      const li = document.createElement('li');
      li.className = `wk-item ${cls}`;
      li.innerHTML = `
        <span class="wk-rank">${r}</span>
        <div class="wk-body">
          <div class="wk-word">${item.keyword}</div>
          <div class="wk-meta">
            <span class="wk-count">${item.count}</span>
            <span class="wk-trend ${td.cls}">${td.txt}</span>
          </div>
        </div>
      `;
      listEl.appendChild(li);
    });

    // 데이터가 없을 때
    if(!listEl.children.length){
      listEl.innerHTML = `<li class="wk-item"><span class="wk-rank">–</span><div class="wk-body"><div class="wk-word">이번주 데이터가 아직 없어요</div><div class="wk-meta"><span class="wk-count">0</span><span class="wk-trend same">–</span></div></div></li>`;
    }
  }catch(e){
    // 오류 메시지
    listEl.innerHTML = `<li class="wk-item"><span class="wk-rank">!</span><div class="wk-body"><div class="wk-word">데이터를 불러오지 못했습니다</div><div class="wk-meta"><span class="wk-count">0</span><span class="wk-trend same">–</span></div></div></li>`;
  }
})();


