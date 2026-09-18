(() => {
  "use strict";

  const display = document.getElementById("display");
  const expression = document.getElementById("expression");
  const status = document.getElementById("status");
  const keys = document.querySelector(".keys");

  let current = "0";
  let stored = null;
  let operator = null;
  let waitingForOperand = false;
  let justCalculated = false;

  const operatorSymbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  function updateDisplay() {
    display.textContent = current;
    if (stored !== null && operator) {
      expression.textContent = `${formatNumber(stored)} ${operatorSymbols[operator]}`;
    } else {
      expression.textContent = "";
    }
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "Error";
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(12)));
  }

  function showStatus(message = "") {
    status.textContent = message;
  }

  function inputDigit(digit) {
    showStatus("");

    if (justCalculated || waitingForOperand) {
      current = digit;
      waitingForOperand = false;
      justCalculated = false;
      updateDisplay();
      return;
    }

    if (current === "0") current = digit;
    else if (current.length < 15) current += digit;
    updateDisplay();
  }

  function inputDecimal() {
    showStatus("");
    if (justCalculated || waitingForOperand) {
      current = "0.";
      waitingForOperand = false;
      justCalculated = false;
    } else if (!current.includes(".")) {
      current += ".";
    }
    updateDisplay();
  }

  function chooseOperator(nextOperator) {
    showStatus("");
    const inputValue = Number(current);

    if (!Number.isFinite(inputValue)) return;

    if (operator && stored !== null && !waitingForOperand) {
      const result = calculate(stored, inputValue, operator);
      if (result === null) return;
      current = formatNumber(result);
      stored = result;
    } else {
      stored = inputValue;
    }

    operator = nextOperator;
    waitingForOperand = true;
    justCalculated = false;
    updateDisplay();
  }

  function calculate(a, b, op) {
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    if (op === "*") return a * b;
    if (op === "/") {
      if (b === 0) {
        current = "0";
        stored = null;
        operator = null;
        waitingForOperand = true;
        updateDisplay();
        showStatus("Cannot divide by zero");
        return null;
      }
      return a / b;
    }
    return null;
  }

  function equals() {
    showStatus("");
    if (stored === null || operator === null) return;

    const b = Number(current);
    const result = calculate(stored, b, operator);
    if (result === null) return;

    expression.textContent = `${formatNumber(stored)} ${operatorSymbols[operator]} ${formatNumber(b)}`;
    current = formatNumber(result);
    stored = null;
    operator = null;
    waitingForOperand = false;
    justCalculated = true;
    updateDisplay();
  }

  function clearAll() {
    current = "0";
    stored = null;
    operator = null;
    waitingForOperand = false;
    justCalculated = false;
    showStatus("");
    updateDisplay();
  }

  function deleteLast() {
    showStatus("");
    if (waitingForOperand || justCalculated) {
      current = "0";
      justCalculated = false;
      updateDisplay();
      return;
    }
    current = current.length > 1 ? current.slice(0, -1) : "0";
    if (current === "-") current = "0";
    updateDisplay();
  }

  function toggleSign() {
    showStatus("");
    if (current === "0") return;
    current = current.startsWith("-") ? current.slice(1) : `-${current}`;
    updateDisplay();
  }

  function percent() {
    showStatus("");
    const value = Number(current);
    if (!Number.isFinite(value)) return;
    current = formatNumber(value / 100);
    updateDisplay();
  }

  function handleAction(action) {
    if (action === "clear") clearAll();
    else if (action === "delete") deleteLast();
    else if (action === "decimal") inputDecimal();
    else if (action === "sign") toggleSign();
    else if (action === "percent") percent();
    else if (action === "equals") equals();
  }

  keys.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {
      if (/^[0-9]$/.test(value)) inputDigit(value);
      else chooseOperator(value);
    } else if (action) {
      handleAction(action);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (/^[0-9]$/.test(event.key)) {
      inputDigit(event.key);
      return;
    }

    if (event.key === ".") {
      inputDecimal();
      return;
    }

    if (["+", "-", "*", "/"].includes(event.key)) {
      chooseOperator(event.key);
      return;
    }

    if (event.key === "%") {
      percent();
      return;
    }

    if (event.key === "Enter" || event.key === "=") {
      event.preventDefault();
      equals();
      return;
    }

    if (event.key === "Backspace") {
      deleteLast();
      return;
    }

    if (event.key === "Escape") {
      clearAll();
    }
  });

  updateDisplay();
})();
