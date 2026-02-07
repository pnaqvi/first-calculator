/**
 * Standard Calculator Module
 * Handles basic arithmetic operations: +, -, *, /, %
 */
const StandardCalculator = (function() {
    // State
    let currentValue = '0';
    let previousValue = '';
    let operator = null;
    let shouldResetDisplay = false;
    let expression = '';

    // DOM Elements
    const displayResult = document.getElementById('std-result');
    const displayExpression = document.getElementById('std-expression');

    // Update display
    function updateDisplay() {
        displayResult.textContent = formatNumber(currentValue);
        displayExpression.textContent = expression;
    }

    // Format number for display
    function formatNumber(num) {
        if (num === 'Error') return num;

        const parsed = parseFloat(num);
        if (isNaN(parsed)) return '0';

        // Handle very large or very small numbers
        if (Math.abs(parsed) > 1e12 || (Math.abs(parsed) < 1e-10 && parsed !== 0)) {
            return parsed.toExponential(6);
        }

        // Format with commas for readability, but limit decimal places
        const parts = num.toString().split('.');
        if (parts[1] && parts[1].length > 10) {
            return parseFloat(num).toFixed(10).replace(/\.?0+$/, '');
        }

        return num;
    }

    // Input a number
    function inputNumber(num) {
        if (shouldResetDisplay) {
            currentValue = num;
            shouldResetDisplay = false;
        } else {
            if (currentValue === '0' && num !== '.') {
                currentValue = num;
            } else if (currentValue.replace(/[^0-9]/g, '').length < 15) {
                currentValue += num;
            }
        }
        updateDisplay();
    }

    // Input decimal point
    function inputDecimal() {
        if (shouldResetDisplay) {
            currentValue = '0.';
            shouldResetDisplay = false;
        } else if (!currentValue.includes('.')) {
            currentValue += '.';
        }
        updateDisplay();
    }

    // Input operator
    function inputOperator(op) {
        const current = parseFloat(currentValue);

        if (operator && !shouldResetDisplay) {
            calculate();
        }

        previousValue = currentValue;
        operator = op;
        shouldResetDisplay = true;

        const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || op;
        expression = `${formatNumber(previousValue)} ${opSymbol}`;
        updateDisplay();
    }

    // Calculate result
    function calculate() {
        if (!operator || shouldResetDisplay) return;

        const prev = parseFloat(previousValue);
        const current = parseFloat(currentValue);
        let result;

        switch (operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    currentValue = 'Error';
                    expression = '';
                    operator = null;
                    previousValue = '';
                    shouldResetDisplay = true;
                    updateDisplay();
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' }[operator] || operator;
        expression = `${formatNumber(previousValue)} ${opSymbol} ${formatNumber(currentValue)} =`;

        currentValue = result.toString();
        operator = null;
        previousValue = '';
        shouldResetDisplay = true;
        updateDisplay();
    }

    // Clear all
    function clear() {
        currentValue = '0';
        previousValue = '';
        operator = null;
        shouldResetDisplay = false;
        expression = '';
        updateDisplay();
    }

    // Backspace
    function backspace() {
        if (shouldResetDisplay || currentValue === 'Error') {
            clear();
            return;
        }

        currentValue = currentValue.slice(0, -1) || '0';
        updateDisplay();
    }

    // Negate
    function negate() {
        if (currentValue !== '0' && currentValue !== 'Error') {
            currentValue = currentValue.startsWith('-')
                ? currentValue.slice(1)
                : '-' + currentValue;
            updateDisplay();
        }
    }

    // Percent
    function percent() {
        const current = parseFloat(currentValue);
        currentValue = (current / 100).toString();
        updateDisplay();
    }

    // Handle button click
    function handleClick(e) {
        const btn = e.target.closest('.btn');
        if (!btn) return;

        const action = btn.dataset.action;
        const value = btn.dataset.value;

        switch (action) {
            case 'number':
                inputNumber(value);
                break;
            case 'decimal':
                inputDecimal();
                break;
            case 'operator':
                inputOperator(value);
                break;
            case 'equals':
                calculate();
                break;
            case 'clear':
                clear();
                break;
            case 'backspace':
                backspace();
                break;
            case 'negate':
                negate();
                break;
            case 'percent':
                percent();
                break;
        }
    }

    // Handle keyboard input
    function handleKeyboard(e) {
        if (document.getElementById('standard').classList.contains('active')) {
            const key = e.key;

            if (/^[0-9]$/.test(key)) {
                e.preventDefault();
                inputNumber(key);
            } else if (key === '.') {
                e.preventDefault();
                inputDecimal();
            } else if (['+', '-', '*', '/'].includes(key)) {
                e.preventDefault();
                inputOperator(key);
            } else if (key === 'Enter' || key === '=') {
                e.preventDefault();
                calculate();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                e.preventDefault();
                clear();
            } else if (key === 'Backspace') {
                e.preventDefault();
                backspace();
            } else if (key === '%') {
                e.preventDefault();
                percent();
            }
        }
    }

    // Initialize
    function init() {
        const keypad = document.querySelector('.standard-keypad');
        keypad.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyboard);
        updateDisplay();
    }

    // Public API
    return {
        init
    };
})();
