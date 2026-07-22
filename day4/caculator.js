// ============================================
//  콘솔창 사칙연산 계산기
//  - 4칙연산 계산 (+, -, *, /)
//  - 길이가 긴 계산식도 처리
//  - 우선순위 적용 (*, / 를 +, - 보다 먼저 계산)
// ============================================

// ----- 1. 기본 연산 함수 -----
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

// ----- 2. 계산식 입력받기 -----
function inputFormula() {
  return prompt("계산식을 입력하세요. (예: 1 + 2 * 3)");
}

// ----- 3. 계산식을 토큰(숫자/연산자) 배열로 나누기 -----
// "1 + 2 * 3"  ->  ["1", "+", "2", "*", "3"]
function splitTokens(formula) {
  return formula.trim().split(/\s+/); // 공백 기준으로 자르기
}

// ----- 4. 입력이 올바른지 확인 -----
// 계산식은 항상 [숫자 연산자 숫자 연산자 숫자 ...] 형태
// -> 토큰 개수는 3개 이상이고 홀수여야 함
function isValidFormula(tokens) {
  if (tokens.length < 3) return false;
  if (tokens.length % 2 === 0) return false;
  return true;
}

// ----- 5. 1단계: 곱셈/나눗셈 먼저 계산 -----
// *, / 를 만나면 앞의 숫자와 즉시 계산해서 결과로 바꿔치기
// "1 + 2 * 3"  ->  ["1", "+", 6]
function calcMultiplyDivide(tokens) {
  const result = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === "*" || token === "/") {
      const left = Number(result.pop());   // 앞에 넣어둔 숫자 꺼내기
      const right = Number(tokens[i + 1]);  // 연산자 다음 숫자

      if (token === "*") {
        result.push(multiply(left, right));
      } else {
        result.push(divide(left, right));
      }
      i += 2; // 연산자와 오른쪽 숫자를 건너뜀
    } else {
      result.push(token);
      i += 1;
    }
  }

  return result;
}

// ----- 6. 2단계: 덧셈/뺄셈 계산 -----
// 곱셈/나눗셈이 끝난 뒤 남은 +, - 를 왼쪽부터 순서대로 계산
// ["1", "+", 6]  ->  7
function calcAddSubtract(tokens) {
  let result = Number(tokens[0]);

  for (let i = 1; i < tokens.length; i += 2) {
    const operator = tokens[i];
    const next = Number(tokens[i + 1]);

    if (operator === "+") {
      result = add(result, next);
    } else if (operator === "-") {
      result = subtract(result, next);
    }
  }

  return result;
}

// ----- 7. 전체 계산 과정 묶기 -----
function calculate(formula) {
  const tokens = splitTokens(formula);

  // 형식 검사
  if (!isValidFormula(tokens)) {
    return "잘못된 계산식입니다. (예: 1 + 2 * 3)";
  }

  // 우선순위대로 계산: 곱셈/나눗셈 -> 덧셈/뺄셈
  const afterMulDiv = calcMultiplyDivide(tokens);
  const answer = calcAddSubtract(afterMulDiv);

  // 숫자가 아니면 잘못된 입력
  if (isNaN(answer)) {
    return "숫자와 연산자를 올바르게 입력해주세요.";
  }

  return answer;
}

// ----- 8. 시작 함수 (콘솔에서 start() 로 실행) -----
function start() {
  const formula = inputFormula();

  // 입력을 취소하거나 비워둔 경우
  if (!formula) {
    console.log("계산식이 입력되지 않았습니다.");
    return;
  }

  const result = calculate(formula);
  console.log("결과: " + result);
}
