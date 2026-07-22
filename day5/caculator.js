// ============================================
//  querySelector + addEventListener 계산기
//  - 버튼 클릭으로 숫자/연산자 입력
//  - Enter로 계산, C로 초기화, ON/OFF로 전원
//  - *, / 우선순위 적용
// ============================================

// ----- 1. querySelector로 화면 요소 가져오기 -----
const display = document.querySelector("#display");        // 결과 표시창 (id 선택)
const numberButtons = document.querySelectorAll(".number");  // 숫자 버튼 전체 (class 선택)
const operatorButtons = document.querySelectorAll(".operator");
const clearButton = document.querySelector(".clear");
const enterButton = document.querySelector(".enter");
const powerButton = document.querySelector(".on-off");

// ----- 2. 계산기 상태 -----
let isPowerOn = false;   // 전원이 켜져 있는지
let expression = "";     // 지금까지 입력한 계산식 문자열

// ----- 3. 화면 갱신 -----
function updateDisplay(text) {
  display.value = text;
}

// ----- 4. 숫자(또는 소수점) 입력 -----
function appendNumber(value) {
  if (!isPowerOn) return;   // 전원이 꺼져 있으면 무시
  expression += value;
  updateDisplay(expression);
}

// ----- 5. 연산자 입력 -----
function appendOperator(value) {
  if (!isPowerOn) return;
  if (expression === "") return;   // 아무것도 없을 때 연산자부터 못 넣게
  // 공백으로 감싸서 나중에 계산식을 쉽게 나눌 수 있게 함
  expression += " " + value + " ";
  updateDisplay(expression);
}

// ----- 6. 초기화(C) -----
function clearDisplay() {
  if (!isPowerOn) return;
  expression = "";
  updateDisplay("0");
}

// ----- 7. 전원 ON/OFF -----
function togglePower() {
  isPowerOn = !isPowerOn;
  powerButton.classList.toggle("on", isPowerOn); // 켜지면 초록색(.on)
  expression = "";
  updateDisplay(isPowerOn ? "0" : "");
}

// ----- 8. 계산 실행(Enter) -----
function performCalculate() {
  if (!isPowerOn) return;
  const result = calculate(expression);
  updateDisplay(result);
  // 계산 결과를 이어서 쓸 수 있게, 숫자면 식에 반영
  expression = typeof result === "number" ? String(result) : "";
}

// ============================================
//  계산 로직 (우선순위: *,/ 먼저 → +,- 나중)
// ============================================
function calculate(formula) {
  const tokens = formula.trim().split(/\s+/); // 공백 기준으로 토큰 나누기

  if (tokens.length < 3 || tokens.length % 2 === 0) {
    return "Error";
  }

  // 1단계: 곱셈/나눗셈 먼저
  const afterMulDiv = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token === "*" || token === "/") {
      const left = Number(afterMulDiv.pop());
      const right = Number(tokens[i + 1]);
      if (token === "/" && right === 0) return "0으로 못 나눔";
      afterMulDiv.push(token === "*" ? left * right : left / right);
      i += 2;
    } else {
      afterMulDiv.push(token);
      i += 1;
    }
  }

  // 2단계: 덧셈/뺄셈
  let result = Number(afterMulDiv[0]);
  for (let j = 1; j < afterMulDiv.length; j += 2) {
    const operator = afterMulDiv[j];
    const next = Number(afterMulDiv[j + 1]);
    if (operator === "+") result += next;
    else if (operator === "-") result -= next;
  }

  if (isNaN(result)) return "Error";

  // 소수점 오차 정리 (0.1 + 0.2 문제 완화)
  return Math.round(result * 1e10) / 1e10;
}

// ============================================
//  addEventListener로 버튼에 이벤트 연결
// ============================================

// 숫자 버튼: 반복문으로 각각 클릭 이벤트 등록
numberButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    appendNumber(button.dataset.value); // data-value 값을 읽어 입력
  });
});

// 연산자 버튼
operatorButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    appendOperator(button.dataset.value);
  });
});

// 기능 버튼
clearButton.addEventListener("click", clearDisplay);
enterButton.addEventListener("click", performCalculate);
powerButton.addEventListener("click", togglePower);
