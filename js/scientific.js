/**
 * Scientific Calculator Module
 * Handles advanced operations: trig, logs, exponents, factorial
 */
const ScientificCalculator = (function() {
    // State
    let expression = '';
    let lastResult = '0';

    // DOM Elements
    const displayResult = document.getElementById('sci-result');
    const displayExpression = document.getElementById('sci-expression');

    // Update display
    function updateDisplay() {
        displayExpression.textContent = expression;
        displayResult.textContent = formatNumber(lastResult);
    }

    // Format number for display
    function formatNumber(num) {
        if (num === 'Error' || num === 'Infinity' || num === '-Infinity') return 'Error';

        const parsed = parseFloat(num);
        if (isNaN(parsed)) return '0';

        if (Math.abs(parsed) > 1e12 || (Math.abs(parsed) < 1e-10 && parsed !== 0)) {
            return parsed.toExponential(6);
        }

        if (Number.isInteger(parsed)) {
            return parsed.toString();
        }

        return parseFloat(parsed.toPrecision(12)).toString();
    }

    // Factorial helper
    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        if (n > 170) return Infinity;
        if (!Number.isInteger(n)) return gamma(n + 1);

        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    // Gamma function approximation for non-integers
    function gamma(z) {
        if (z < 0.5) {
            return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
        }
        z -= 1;
        const g = 7;
        const c = [
            0.99999999999980993,
            676.5203681218851,
            -1259.1392167224028,
            771.32342877765313,
            -176.61502916214059,
            12.507343278686905,
            -0.13857109526572012,
            9.9843695780195716e-6,
            1.5056327351493116e-7
        ];
        let x = c[0];
        for (let i = 1; i < g + 2; i++) {
            x += c[i] / (z + i);
        }
        const t = z + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    }

    // Evaluate expression safely
    function evaluateExpression(expr) {
        try {
            // Replace display symbols with math operators
            let mathExpr = expr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/π/g, Math.PI.toString())
                .replace(/e(?![xp])/g, Math.E.toString());

            // Replace math functions
            mathExpr = mathExpr
                .replace(/sin\(/g, 'Math.sin((Math.PI/180)*')
                .replace(/cos\(/g, 'Math.cos((Math.PI/180)*')
                .replace(/tan\(/g, 'Math.tan((Math.PI/180)*')
                .replace(/asin\(/g, '(180/Math.PI)*Math.asin(')
                .replace(/acos\(/g, '(180/Math.PI)*Math.acos(')
                .replace(/atan\(/g, '(180/Math.PI)*Math.atan(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/\^/g, '**');

            // Handle factorial
            mathExpr = mathExpr.replace(/(\d+(?:\.\d+)?|\))!/g, (match, num) => {
                if (num === ')') {
                    return '/*!';
                }
                return `factorial(${num})`;
            });

            // Process factorial for parenthesized expressions
            while (mathExpr.includes('/*!')) {
                mathExpr = mathExpr.replace(/\(([^()]+)\)\/\*!/g, (_, inner) => {
                    return `factorial(${inner})`;
                });
            }

            // Validate expression (basic security check)
            if (!/^[\d\s+\-*/().Math\w,]*$/.test(mathExpr)) {
                return 'Error';
            }

            // Create safe evaluation context
            const safeEval = new Function('factorial', `return ${mathExpr}`);
            const result = safeEval(factorial);

            if (typeof result !== 'number' || !isFinite(result)) {
                return isNaN(result) ? 'Error' : result.toString();
            }

            return result.toString();
        } catch (e) {
            return 'Error';
        }
    }

    // Input number
    function inputNumber(num) {
        if (lastResult !== '0' && expression === '') {
            expression = '';
        }
        expression += num;
        lastResult = evaluateExpression(expression);
        updateDisplay();
    }

    // Input decimal
    function inputDecimal() {
        const parts = expression.split(/[\+\-\×\÷\(\)]/);
        const lastPart = parts[parts.length - 1];
        if (!lastPart.includes('.')) {
            if (lastPart === '' || /[\+\-\×\÷\(\)]$/.test(expression)) {
                expression += '0';
            }
            expression += '.';
            updateDisplay();
        }
    }

    // Input operator
    function inputOperator(op) {
        const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷', '^': '^' }[op] || op;

        // Don't add operator if expression is empty (except minus)
        if (expression === '' && op !== '-') {
            if (lastResult !== '0') {
                expression = lastResult;
            } else {
                return;
            }
        }

        // Replace last operator if needed
        if (/[+−×÷\^]$/.test(expression)) {
            expression = expression.slice(0, -1);
        }

        expression += opSymbol;
        updateDisplay();
    }

    // Input function (sin, cos, etc.)
    function inputFunction(fn) {
        const funcMap = {
            'sin': 'sin(',
            'cos': 'cos(',
            'tan': 'tan(',
            'asin': 'asin(',
            'acos': 'acos(',
            'atan': 'atan(',
            'log': 'log(',
            'ln': 'ln(',
            'sqrt': 'sqrt(',
            'square': '^2',
            'factorial': '!'
        };

        const funcText = funcMap[fn];
        if (!funcText) return;

        if (fn === 'square' || fn === 'factorial') {
            if (expression === '' && lastResult !== '0') {
                expression = lastResult;
            }
            expression += funcText;
        } else {
            expression += funcText;
        }

        lastResult = evaluateExpression(expression);
        updateDisplay();
    }

    // Input constant
    function inputConstant(constant) {
        const constMap = {
            'pi': 'π',
            'e': 'e'
        };
        expression += constMap[constant] || '';
        lastResult = evaluateExpression(expression);
        updateDisplay();
    }

    // Input parenthesis
    function inputParenthesis(paren) {
        expression += paren;
        updateDisplay();
    }

    // Calculate
    function calculate() {
        if (expression === '') return;

        const result = evaluateExpression(expression);
        displayExpression.textContent = expression + ' =';
        lastResult = result;
        expression = '';
        displayResult.textContent = formatNumber(lastResult);
    }

    // Clear
    function clear() {
        expression = '';
        lastResult = '0';
        updateDisplay();
    }

    // Backspace
    function backspace() {
        if (expression.length > 0) {
            // Remove function names as a unit
            const funcMatch = expression.match(/(sin|cos|tan|asin|acos|atan|log|ln|sqrt)\($/);
            if (funcMatch) {
                expression = expression.slice(0, -funcMatch[0].length);
            } else {
                expression = expression.slice(0, -1);
            }
            lastResult = expression ? evaluateExpression(expression) : '0';
            updateDisplay();
        }
    }

    // Negate
    function negate() {
        if (expression === '' && lastResult !== '0') {
            expression = lastResult;
        }

        if (expression.startsWith('−') || expression.startsWith('-')) {
            expression = expression.slice(1);
        } else {
            expression = '−' + expression;
        }

        lastResult = evaluateExpression(expression);
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
            case 'function':
                inputFunction(value);
                break;
            case 'constant':
                inputConstant(value);
                break;
            case 'parenthesis':
                inputParenthesis(value);
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
        }
    }

    // Handle keyboard
    function handleKeyboard(e) {
        if (document.getElementById('scientific').classList.contains('active')) {
            const key = e.key;

            if (/^[0-9]$/.test(key)) {
                e.preventDefault();
                inputNumber(key);
            } else if (key === '.') {
                e.preventDefault();
                inputDecimal();
            } else if (['+', '-', '*', '/', '^'].includes(key)) {
                e.preventDefault();
                inputOperator(key);
            } else if (key === '(' || key === ')') {
                e.preventDefault();
                inputParenthesis(key);
            } else if (key === 'Enter' || key === '=') {
                e.preventDefault();
                calculate();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                e.preventDefault();
                clear();
            } else if (key === 'Backspace') {
                e.preventDefault();
                backspace();
            }
        }
    }

    // Initialize
    function init() {
        const keypad = document.querySelector('.scientific-keypad');
        keypad.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyboard);
        updateDisplay();
    }

    return {
        init
    };
})();
