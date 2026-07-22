// ============================================
//  실시간 암호화폐 추적기
//  - Binance API에 매초 GET 요청
//  - USDT 마켓만 표시
//  - 검색 / 관심항목(localStorage) / 탭 분리
// ============================================

const API_URL = "https://api4.binance.com/api/v3/ticker/24hr";

// ----- DOM 요소 가져오기 (querySelector) -----
const coinList = document.querySelector("#coin-list");
const searchInput = document.querySelector("#search");
const tabButtons = document.querySelectorAll(".tab");
const statusEl = document.querySelector("#status");
const favCountEl = document.querySelector("#fav-count");
const emptyMessage = document.querySelector("#empty-message");

// ----- 상태 -----
let allCoins = [];            // API로 받은 전체 USDT 코인
let currentTab = "all";       // "all" 또는 "favorites"
let searchKeyword = "";       // 검색어
let prevPrices = {};          // 이전 가격 (변동 색상 비교용)

// localStorage에서 관심목록 불러오기 (없으면 빈 배열)
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// ----- 관심목록 저장 -----
function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// ----- 관심 추가/제거 (토글) -----
function toggleFavorite(symbol) {
  if (favorites.includes(symbol)) {
    favorites = favorites.filter((s) => s !== symbol); // 제거
  } else {
    favorites.push(symbol); // 추가
  }
  saveFavorites();
  render(); // 화면 갱신
}

// ----- API에서 데이터 가져오기 (매초 호출됨) -----
async function fetchData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // USDT로 끝나는 항목만 필터링
    allCoins = data.filter((coin) => coin.symbol.endsWith("USDT"));

    // 거래량(quoteVolume) 많은 순으로 정렬
    allCoins.sort((a, b) => Number(b.quoteVolume) - Number(a.quoteVolume));

    statusEl.textContent = "🟢 실시간";
    statusEl.classList.add("live");

    render();
  } catch (error) {
    statusEl.textContent = "🔴 연결 오류";
    statusEl.classList.remove("live");
    console.log("데이터를 가져오지 못했습니다:", error);
  }
}

// ----- 숫자 보기 좋게 포맷 -----
function formatPrice(price) {
  const num = Number(price);
  if (num >= 1) return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return num.toPrecision(4); // 1달러 미만은 유효숫자로
}

function formatVolume(volume) {
  const num = Number(volume);
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toFixed(0);
}

// ----- 화면 그리기 -----
function render() {
  // 1) 현재 탭에 맞게 목록 고르기
  let list = allCoins;
  if (currentTab === "favorites") {
    list = allCoins.filter((coin) => favorites.includes(coin.symbol));
  }

  // 2) 검색어로 거르기
  if (searchKeyword) {
    list = list.filter((coin) =>
      coin.symbol.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }

  // 3) 관심항목 개수 갱신
  favCountEl.textContent = favorites.length;

  // 4) 목록이 비었으면 안내 문구
  if (list.length === 0) {
    coinList.innerHTML = "";
    emptyMessage.hidden = false;
    return;
  }
  emptyMessage.hidden = true;

  // 5) 각 코인을 표 행(tr)으로 만들기 (너무 많으면 상위 100개만)
  const rows = list.slice(0, 100).map((coin) => {
    const symbol = coin.symbol;
    const changePercent = Number(coin.priceChangePercent);
    const isUp = changePercent >= 0;
    const isFav = favorites.includes(symbol);

    // 이전 가격과 비교해 깜빡임 클래스 결정
    let flashClass = "";
    const prev = prevPrices[symbol];
    const now = Number(coin.lastPrice);
    if (prev !== undefined && now > prev) flashClass = "flash-up";
    else if (prev !== undefined && now < prev) flashClass = "flash-down";
    prevPrices[symbol] = now;

    // USDT를 뗀 코인 이름 (BTCUSDT -> BTC)
    const coinName = symbol.replace("USDT", "");

    return `
      <tr class="${flashClass}">
        <td class="col-star">
          <button class="star-btn ${isFav ? "active" : ""}" data-symbol="${symbol}">
            ${isFav ? "★" : "☆"}
          </button>
        </td>
        <td class="col-name">${coinName}<span style="color:#8b949e">/USDT</span></td>
        <td class="col-price">${formatPrice(coin.lastPrice)}</td>
        <td class="col-change ${isUp ? "up" : "down"}">
          ${isUp ? "▲" : "▼"} ${Math.abs(changePercent).toFixed(2)}%
        </td>
        <td class="col-volume">${formatVolume(coin.quoteVolume)}</td>
      </tr>
    `;
  });

  coinList.innerHTML = rows.join("");

  // 6) 별 버튼에 이벤트 연결 (다시 그렸으므로 재등록)
  const starButtons = coinList.querySelectorAll(".star-btn");
  starButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleFavorite(btn.dataset.symbol);
    });
  });
}

// ============================================
//  이벤트 리스너 (addEventListener)
// ============================================

// 검색: 입력할 때마다 필터
searchInput.addEventListener("input", (event) => {
  searchKeyword = event.target.value.trim();
  render();
});

// 탭 전환
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    currentTab = button.dataset.tab;
    render();
  });
});

// ============================================
//  시작: 즉시 한 번 + 매초 반복
// ============================================
fetchData();
setInterval(fetchData, 1000); // 1초마다 GET 요청
