const lfTreeHitbox = document.getElementById("lfTreeHitbox");
const lfTreeBody = document.getElementById("lfTreeBody");
const lfClickCountEl = document.getElementById("lfClickCount");
const lfDropCountEl = document.getElementById("lfDropCount");

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
  lfClickCountEl.textContent = clickCount;

  lfTreeBody.classList.remove("shake");
  void lfTreeBody.offsetWidth;
  lfTreeBody.classList.add("shake");

  if (Math.random() < 0.02) {
    dropCount++;
    lfDropCountEl.textContent = dropCount;
    const prize = lfCouponPool[Math.floor(Math.random() * lfCouponPool.length)];
    alert("쿠폰 획득!\n" + prize);
  }
}

lfTreeHitbox.addEventListener("click", lfShake);
lfTreeHitbox.addEventListener("touchstart", (e) => {
  e.preventDefault();
  lfShake();
});

const treeLineEl = document.getElementById("lf-treeDialog");
let linesDB = [];

function pickRandomLine() {
  if (!linesDB || !linesDB.length) return null;
  const idx = Math.floor(Math.random() * linesDB.length);
  return linesDB[idx];
}

function showTreeLine() {
  const line = pickRandomLine();
  if (!line) return;

  treeLineEl.textContent = line;
  treeLineEl.classList.add("show");

  setTimeout(() => {
    treeLineEl.classList.remove("show");
  }, 3000);
}

fetch("https://mrdindoin.ddns.net/data/talktree.json")
  .then(res => res.json())
  .then(data => {
    linesDB = data.lines || [];
    if (!linesDB.length) return;

    showTreeLine();

    setInterval(showTreeLine, 10000);
  })
  .catch(err => {
    console.error("talktree.json 로드 오류:", err);
  });
