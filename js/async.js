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




(async function(){
  const A = document.getElementById('tickerA');
  const B = document.getElementById('tickerB');

  // -------- fetch --------
  let d;
  try{
    const r = await fetch('https://mrdindoin.ddns.net/data/finance.json',{cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    d = await r.json();
  }catch(e){
    const msg = '💸 수익현황을 불러오지 못했습니다.';
    A.textContent = msg; B.textContent = msg;
    return;
  }

  // -------- helpers --------
  const cur = d.currency || 'KRW';
  const sign = (cur==='KRW') ? '₩ ' : '';
  const fmt = v => (v??0).toLocaleString('ko-KR');

  const today  = d.today?.earnings ?? 0;
  const yEarn  = d.yesterday?.earnings ?? 0;
  const yClk   = d.yesterday?.clicks ?? 0;
  const yImp   = d.yesterday?.impressions ?? 0;
  const wEarn  = d.last7days?.earnings ?? 0;
  const wRPM   = Math.round(d.last7days?.rpm ?? 0);
  const mtd    = d.mtd?.earnings ?? 0;
  const prev   = d.last_month?.earnings ?? 0;
  const pay    = (d.payments && d.payments[0]) ? d.payments[0] : null;

  // 선택: breakdown 지원 (예: {"ads":91320,"goods":34100,"funding":27060})
  const b = d.breakdown || {};
  const parts = [];

  parts.push(`💰 이번달 누적: ${sign}${fmt(mtd)}`);
  parts.push(`어제: ${sign}${fmt(yEarn)} (클릭 ${fmt(yClk)} · 노출 ${fmt(yImp)})`);
  parts.push(`최근 7일: ${sign}${fmt(wEarn)} (RPM ${fmt(wRPM)})`);
  if (pay) parts.push(`최근 지급: ${pay.date} ${sign}${fmt(pay.amount||0)}`);

  // breakdown 항목이 있으면 자동 추가
  Object.entries(b).forEach(([k,v])=>{
    const label = ({ads:'광고', goods:'굿즈', funding:'펀딩'})[k] || k;
    parts.push(`${label}: ${sign}${fmt(v)}`);
  });

  const text = parts.join('  ·  ') + '  ·  LocalFlow 재정 루프가 계속 흐릅니다.';

  A.textContent = text;
  B.textContent = text;

  // -------- animation speed: text 길이에 따라 자동 조절 --------
  // (텍스트가 길수록 천천히, 짧으면 빠르게. 최소 16s 보장)
  const measure = document.createElement('span');
  measure.style.visibility = 'hidden';
  measure.style.whiteSpace = 'nowrap';
  measure.textContent = text;
  document.body.appendChild(measure);
  const w = measure.getBoundingClientRect().width; // px
  document.body.removeChild(measure);

  // 60px/s 기준으로 시간 산정, 최소 16초, 최대 40초
  const dur = Math.max(16, Math.min(40, Math.round(w/60)));
  document.documentElement.style.setProperty('--dur', dur+'s');

  // 시작/끝 위치 (뷰포트 밖에서 시작해서 반대쪽 밖으로)
  document.documentElement.style.setProperty('--start','100%');
  document.documentElement.style.setProperty('--end', `-${Math.ceil(w)+80}px`);
})();
