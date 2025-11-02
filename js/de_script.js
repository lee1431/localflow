function setMidnightKST() {
  const now = new Date();
  // 한국시간 기준 0시로 맞추기
  const kstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  kstNow.setHours(0,0,0,0);
  
  const y = kstNow.getFullYear();
  const m = String(kstNow.getMonth() + 1).padStart(2, "0");
  const d = String(kstNow.getDate()).padStart(2, "0");
  const hh = String(kstNow.getHours()).padStart(2, "0");
  const mm = String(kstNow.getMinutes()).padStart(2, "0");
  
  document.querySelector(".wk-updated").textContent = `${y}-${m}-${d} ${hh}:${mm}`;
}
setMidnightKST();
