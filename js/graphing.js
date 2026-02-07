/**
 * Graphing Calculator Module
 * Plots mathematical functions on a coordinate plane
 */
const GraphingCalculator = (function() {
    // State
    let functions = [];
    let canvas, ctx;
    let xMin = -10, xMax = 10, yMin = -10, yMax = 10;

    // Colors for multiple functions
    const colors = [
        '#4a90d9', // Blue
        '#2ecc71', // Green
        '#e74c3c', // Red
        '#f39c12', // Orange
        '#9b59b6', // Purple
        '#1abc9c', // Teal
        '#e91e63', // Pink
        '#00bcd4'  // Cyan
    ];

    // DOM Elements
    const functionInput = document.getElementById('function-expr');
    const plotBtn = document.getElementById('plot-btn');
    const clearBtn = document.getElementById('clear-graph');
    const xMinInput = document.getElementById('x-min');
    const xMaxInput = document.getElementById('x-max');
    const yMinInput = document.getElementById('y-min');
    const yMaxInput = document.getElementById('y-max');
    const functionList = document.getElementById('function-list');

    // Initialize canvas
    function initCanvas() {
        canvas = document.getElementById('graph-canvas');
        ctx = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    // Resize canvas to match container
    function resizeCanvas() {
        const container = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = container.clientWidth * dpr;
        canvas.height = container.clientHeight * dpr;

        ctx.scale(dpr, dpr);
        canvas.style.width = container.clientWidth + 'px';
        canvas.style.height = container.clientHeight + 'px';

        draw();
    }

    // Parse and evaluate mathematical expression
    function parseExpression(expr, x) {
        try {
            // Prepare expression for evaluation
            let mathExpr = expr
                .replace(/\^/g, '**')
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/asin/g, 'Math.asin')
                .replace(/acos/g, 'Math.acos')
                .replace(/atan/g, 'Math.atan')
                .replace(/log/g, 'Math.log10')
                .replace(/ln/g, 'Math.log')
                .replace(/sqrt/g, 'Math.sqrt')
                .replace(/abs/g, 'Math.abs')
                .replace(/exp/g, 'Math.exp')
                .replace(/pi/gi, 'Math.PI')
                .replace(/e(?![xp])/gi, 'Math.E');

            // Handle implicit multiplication: 2x -> 2*x, x(2) -> x*(2)
            mathExpr = mathExpr
                .replace(/(\d)([x])/gi, '$1*$2')
                .replace(/([x])(\d)/gi, '$1*$2')
                .replace(/(\d)\(/g, '$1*(')
                .replace(/\)(\d)/g, ')*$1')
                .replace(/\)\(/g, ')*(')
                .replace(/([x])\(/gi, '$1*(')
                .replace(/\)([x])/gi, ')*$1');

            // Evaluate
            const func = new Function('x', `return ${mathExpr}`);
            return func(x);
        } catch (e) {
            return NaN;
        }
    }

    // Convert graph coordinates to canvas coordinates
    function toCanvasX(x) {
        const width = canvas.width / (window.devicePixelRatio || 1);
        return ((x - xMin) / (xMax - xMin)) * width;
    }

    function toCanvasY(y) {
        const height = canvas.height / (window.devicePixelRatio || 1);
        return height - ((y - yMin) / (yMax - yMin)) * height;
    }

    // Draw grid and axes
    function drawGrid() {
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#0a1628';
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = '#1a2744';
        ctx.lineWidth = 1;

        // Calculate grid step
        const xRange = xMax - xMin;
        const yRange = yMax - yMin;
        const xStep = calculateGridStep(xRange);
        const yStep = calculateGridStep(yRange);

        // Vertical grid lines
        ctx.beginPath();
        for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
            const canvasX = toCanvasX(x);
            ctx.moveTo(canvasX, 0);
            ctx.lineTo(canvasX, height);
        }
        ctx.stroke();

        // Horizontal grid lines
        ctx.beginPath();
        for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
            const canvasY = toCanvasY(y);
            ctx.moveTo(0, canvasY);
            ctx.lineTo(width, canvasY);
        }
        ctx.stroke();

        // Axes
        ctx.strokeStyle = '#3d5a80';
        ctx.lineWidth = 2;

        // X-axis
        if (yMin <= 0 && yMax >= 0) {
            ctx.beginPath();
            ctx.moveTo(0, toCanvasY(0));
            ctx.lineTo(width, toCanvasY(0));
            ctx.stroke();
        }

        // Y-axis
        if (xMin <= 0 && xMax >= 0) {
            ctx.beginPath();
            ctx.moveTo(toCanvasX(0), 0);
            ctx.lineTo(toCanvasX(0), height);
            ctx.stroke();
        }

        // Axis labels
        ctx.fillStyle = '#6b7a8f';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // X-axis labels
        for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
            if (Math.abs(x) > 0.001) {
                const canvasX = toCanvasX(x);
                const canvasY = yMin <= 0 && yMax >= 0 ? toCanvasY(0) + 5 : height - 5;
                ctx.fillText(formatAxisLabel(x), canvasX, canvasY);
            }
        }

        // Y-axis labels
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
            if (Math.abs(y) > 0.001) {
                const canvasX = xMin <= 0 && xMax >= 0 ? toCanvasX(0) + 5 : 5;
                const canvasY = toCanvasY(y);
                ctx.fillText(formatAxisLabel(y), canvasX, canvasY);
            }
        }

        // Origin label
        if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText('0', toCanvasX(0) + 5, toCanvasY(0) + 5);
        }
    }

    // Calculate appropriate grid step
    function calculateGridStep(range) {
        const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
        const normalized = range / magnitude;

        if (normalized <= 2) return magnitude / 5;
        if (normalized <= 5) return magnitude / 2;
        return magnitude;
    }

    // Format axis label
    function formatAxisLabel(value) {
        if (Math.abs(value) >= 1000 || (Math.abs(value) < 0.01 && value !== 0)) {
            return value.toExponential(0);
        }
        return Number(value.toPrecision(3)).toString();
    }

    // Draw a function
    function drawFunction(fn, color) {
        const width = canvas.width / (window.devicePixelRatio || 1);
        const step = (xMax - xMin) / width;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        let isDrawing = false;
        let prevY = null;

        for (let px = 0; px <= width; px++) {
            const x = xMin + px * step;
            const y = parseExpression(fn.expr, x);

            if (isFinite(y) && !isNaN(y)) {
                const canvasY = toCanvasY(y);

                // Check for discontinuities (large jumps)
                if (isDrawing && prevY !== null && Math.abs(canvasY - prevY) > canvas.height) {
                    ctx.stroke();
                    ctx.beginPath();
                    isDrawing = false;
                }

                if (!isDrawing) {
                    ctx.moveTo(px, canvasY);
                    isDrawing = true;
                } else {
                    ctx.lineTo(px, canvasY);
                }

                prevY = canvasY;
            } else {
                if (isDrawing) {
                    ctx.stroke();
                    ctx.beginPath();
                    isDrawing = false;
                }
                prevY = null;
            }
        }

        ctx.stroke();
    }

    // Draw all
    function draw() {
        drawGrid();
        functions.forEach((fn, index) => {
            drawFunction(fn, fn.color);
        });
    }

    // Add function to plot
    function addFunction(expr) {
        if (!expr.trim()) return;

        // Check if already plotted
        if (functions.some(f => f.expr === expr)) {
            return;
        }

        const color = colors[functions.length % colors.length];
        functions.push({ expr, color });

        updateFunctionList();
        draw();
    }

    // Remove function
    function removeFunction(index) {
        functions.splice(index, 1);
        updateFunctionList();
        draw();
    }

    // Update function list display
    function updateFunctionList() {
        functionList.innerHTML = functions.map((fn, index) => `
            <div class="function-item">
                <span class="color-dot" style="background: ${fn.color}"></span>
                <span>f(x) = ${fn.expr}</span>
                <button class="remove-fn" data-index="${index}">×</button>
            </div>
        `).join('');

        // Add remove handlers
        functionList.querySelectorAll('.remove-fn').forEach(btn => {
            btn.addEventListener('click', () => {
                removeFunction(parseInt(btn.dataset.index));
            });
        });
    }

    // Update range
    function updateRange() {
        const newXMin = parseFloat(xMinInput.value) || -10;
        const newXMax = parseFloat(xMaxInput.value) || 10;
        const newYMin = parseFloat(yMinInput.value) || -10;
        const newYMax = parseFloat(yMaxInput.value) || 10;

        if (newXMin < newXMax && newYMin < newYMax) {
            xMin = newXMin;
            xMax = newXMax;
            yMin = newYMin;
            yMax = newYMax;
            draw();
        }
    }

    // Clear all functions
    function clearAll() {
        functions = [];
        functionInput.value = '';
        updateFunctionList();
        draw();
    }

    // Event handlers
    function setupEventListeners() {
        plotBtn.addEventListener('click', () => {
            addFunction(functionInput.value);
            functionInput.value = '';
        });

        functionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addFunction(functionInput.value);
                functionInput.value = '';
            }
        });

        clearBtn.addEventListener('click', clearAll);

        [xMinInput, xMaxInput, yMinInput, yMaxInput].forEach(input => {
            input.addEventListener('change', updateRange);
        });
    }

    // Initialize
    function init() {
        initCanvas();
        setupEventListeners();
        draw();
    }

    return {
        init
    };
})();
