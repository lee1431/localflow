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


const treeLine = document.getElementById("lf-treeDialog");
let linesDB = null;
let lastLineTime = 0;

// JSON 불러오기
fetch("https://mrdindoin.ddns.net/data/talktree.json")
  .then(res => res.json())
  .then(data => linesDB = data);

// 랜덤 문구 선택
function pickRandomLine() {
  if (!linesDB) return null;

  const types = ["wit", "philosophy", "joke"];
  const pickType = types[Math.floor(Math.random() * types.length)];
  const arr = linesDB[pickType];

  return arr[Math.floor(Math.random() * arr.length)];
}

// 자동 대사 출력
function showTreeLine() {
  const now = Date.now();

  // 쿨타임 5초
  if (now - lastLineTime < 5000) return;
  lastLineTime = now;

  // 확률 20%
  if (Math.random() > 0.2) return;

  const line = pickRandomLine();
  if (!line) return;

  // 표시
  treeLine.textContent = line;
  treeLine.classList.add("show");

  // 3초 후 사라짐
  setTimeout(() => {
    treeLine.classList.remove("show");
  }, 3000);
}

// 자동 반복 — 매초 체크
setInterval(showTreeLine, 1000);
