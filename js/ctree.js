const lfTreeHitbox = document.getElementById("lfTreeHitbox");
const lfTreeBody = document.getElementById("lfTreeBody");
const lfClickCount = document.getElementById("lfClickCount");
const lfDropCount = document.getElementById("lfDropCount");

let clickCount = 0;
let dropCount = 0;
let isCooling = false;

const lfCouponPool = [
  "BHC 치킨 50% 할인쿠폰",
  "성수농원 체리 2kg · 5,000원 할인",
  "로컬 카페 아메리카노 1+1",
  "충주사랑상품권 1만원권"
];

function lfShake() {
  if (isCooling) return;
  isCooling = true;
  setTimeout(() => (isCooling = false), 120);

  clickCount++;
  lfClickCount.textContent = clickCount;

  lfTreeBody.classList.remove("shake");
  void lfTreeBody.offsetWidth;
  lfTreeBody.classList.add("shake");

  showTreeLine();

  if (Math.random() < 0.02) {
    dropCount++;
    lfDropCount.textContent = dropCount;
    alert("쿠폰 획득!\n" + lfCouponPool[Math.floor(Math.random() * lfCouponPool.length)]);
  }
}

lfTreeHitbox.addEventListener("click", lfShake);
lfTreeHitbox.addEventListener("touchstart", e => {
  e.preventDefault();
  lfShake();
});


let treeLines = [];
let isLineLoaded = false;

// JSON 로드
fetch("https://mrdindoin.ddns.net/data/talktree.json")
  .then(res => res.json())
  .then(data => {
    treeLines = data.lines;
    isLineLoaded = true;
  });

// 랜덤 문장 출력
function showTreeLine() {
  if (!isLineLoaded || treeLines.length === 0) return;

  const lineEl = document.getElementById("lf-treeDialog");
  const randomLine = treeLines[Math.floor(Math.random() * treeLines.length)];

  lineEl.textContent = randomLine;

  // fade-in
  lineEl.classList.remove("show");
  void lineEl.offsetWidth; 
  lineEl.classList.add("show");
}
