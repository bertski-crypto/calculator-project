(() => {
  "use strict";

  const display = document.getElementById("display");
  const expression = document.getElementById("expression");
  const status = document.getElementById("status");
  const keys = document.querySelector(".keys");
  const calculator = document.querySelector(".calculator");
  const modeToggle = document.getElementById("mode-toggle");
  const themeOptions = document.querySelectorAll(".theme-option");
  const themeStorageKey = "calculator-theme";

  let current = "0";
  let stored = null;
  let operator = null;
  let waitingForOperand = false;
  let justCalculated = false;
  let scientificExpression = "";

  const operatorSymbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  function setTheme(theme, persist = true) {
    const selectedTheme = [...themeOptions].some((option) => option.dataset.theme === theme)
      ? theme
      : "sunset";

    document.body.dataset.theme = selectedTheme;
    themeOptions.forEach((option) => {
      option.setAttribute("aria-pressed", String(option.dataset.theme === selectedTheme));
    });

    if (persist) {
      localStorage.setItem(themeStorageKey, selectedTheme);
    }
  }

  function updateDisplay() {
    if (calculator.classList.contains("scientific")) {
      expression.textContent = "";
      display.textContent = scientificExpression || "0";
      return;
    }
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

  function evaluateScientific(source) {
    const input = source.replace(/\s+/g, "");
    let position = 0;

    function peek() { return input[position]; }
    function match(value) {
      if (input.slice(position, position + value.length) === value) {
        position += value.length;
        return true;
      }
      return false;
    }
    function parseExpression() {
      let value = parseTerm();
      while (peek() === "+" || peek() === "-") {
        const operatorValue = input[position++];
        const right = parseTerm();
        value = operatorValue === "+" ? value + right : value - right;
      }
      return value;
    }
    function parseTerm() {
      let value = parsePower();
      while (peek() === "*" || peek() === "/") {
        const operatorValue = input[position++];
        const right = parsePower();
        if (operatorValue === "/" && right === 0) throw new Error("Cannot divide by zero");
        value = operatorValue === "*" ? value * right : value / right;
      }
      return value;
    }
    function parsePower() {
      const value = parseUnary();
      if (match("^")) return Math.pow(value, parsePower());
      return value;
    }
    function parseUnary() {
      if (match("+")) return parseUnary();
      if (match("-")) return -parseUnary();
      return parsePrimary();
    }
    function parsePrimary() {
      if (match("(")) {
        const value = parseExpression();
        if (!match(")")) throw new Error("Missing closing parenthesis");
        return value;
      }
      const functionMatch = input.slice(position).match(/^(sin|cos|tan|log|ln|sqrt)\(/);
      if (functionMatch) {
        position += functionMatch[0].length;
        const value = parseExpression();
        if (!match(")")) throw new Error("Missing closing parenthesis");
        const name = functionMatch[1];
        if (name === "sqrt" && value < 0) throw new Error("Invalid square root");
        if ((name === "log" || name === "ln") && value <= 0) throw new Error("Invalid logarithm");
        if (name === "sin") return Math.sin(value);
        if (name === "cos") return Math.cos(value);
        if (name === "tan") return Math.tan(value);
        if (name === "log") return Math.log10(value);
        if (name === "ln") return Math.log(value);
        return Math.sqrt(value);
      }
      if (match("PI")) return Math.PI;
      const numberMatch = input.slice(position).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
      if (!numberMatch) throw new Error("Incomplete expression");
      position += numberMatch[0].length;
      return Number(numberMatch[0]);
    }

    const result = parseExpression();
    if (position !== input.length || !Number.isFinite(result)) throw new Error("Invalid expression");
    return result;
  }

  function inputScientific(value) {
    showStatus("");
    if (justCalculated) {
      scientificExpression = "";
      justCalculated = false;
    }
    scientificExpression += value;
    updateDisplay();
  }

  function scientificEquals() {
    if (!scientificExpression) return;
    try {
      const result = evaluateScientific(scientificExpression);
      expression.textContent = scientificExpression;
      scientificExpression = formatNumber(result);
      justCalculated = true;
      updateDisplay();
      showStatus("");
    } catch (error) {
      showStatus(error.message);
    }
  }

  function setMode(scientific) {
    calculator.classList.toggle("scientific", scientific);
    modeToggle.setAttribute("aria-pressed", String(scientific));
    modeToggle.textContent = scientific ? "Standard mode" : "Scientific mode";
    clearAll();
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
    scientificExpression = "";
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
    if (calculator.classList.contains("scientific")) {
      if (action === "clear") clearAll();
      else if (action === "delete") {
        scientificExpression = scientificExpression.slice(0, -1);
        updateDisplay();
      } else if (action === "decimal") inputScientific(".");
      else if (action === "sign") inputScientific("-");
      else if (action === "percent") inputScientific("/100");
      else if (action === "equals") scientificEquals();
      return;
    }

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
    const scientificValue = button.dataset.scientific;

    if (scientificValue !== undefined) {
      inputScientific(scientificValue);
      return;
    }

    if (value !== undefined) {
      if (calculator.classList.contains("scientific")) inputScientific(value);
      else if (/^[0-9]$/.test(value)) inputDigit(value);
      else chooseOperator(value);
    } else if (action) {
      handleAction(action);
    }
  });

  themeOptions.forEach((option) => {
    option.addEventListener("click", () => setTheme(option.dataset.theme));
  });

  modeToggle.addEventListener("click", () => {
    setMode(!calculator.classList.contains("scientific"));
  });

  document.addEventListener("keydown", (event) => {
    if (/^[0-9]$/.test(event.key)) {
      if (calculator.classList.contains("scientific")) inputScientific(event.key);
      else inputDigit(event.key);
      return;
    }

    if (event.key === ".") {
      if (calculator.classList.contains("scientific")) inputScientific(".");
      else inputDecimal();
      return;
    }

    if (["+", "-", "*", "/"].includes(event.key)) {
      if (calculator.classList.contains("scientific")) inputScientific(event.key);
      else chooseOperator(event.key);
      return;
    }

    if (event.key === "%") {
      percent();
      return;
    }

    if (event.key === "Enter" || event.key === "=") {
      event.preventDefault();
      if (calculator.classList.contains("scientific")) scientificEquals();
      else equals();
      return;
    }

    if (event.key === "Backspace") {
      if (calculator.classList.contains("scientific")) {
        scientificExpression = scientificExpression.slice(0, -1);
        updateDisplay();
      } else deleteLast();
      return;
    }

    if (event.key === "Escape") {
      clearAll();
    }
  });

  setTheme(localStorage.getItem(themeStorageKey) || "sunset", false);
  updateDisplay();
})();
