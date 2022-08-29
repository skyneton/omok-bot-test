class Board {
    #canvas;
    #ctx;
    #rows;
    #cols;
    #cellSize;
    #bgColor;
    #moveCallback;
    #clickCallback;
    set rows(val) {
        this.#rows = val;
    }
    set cols(val) {
        this.#cols = val;
    }
    set cellSize(val) {
        this.#cellSize = val;
    }
    set bgColor(color) {
        this.#bgColor = color;
    }

    get rows() { return this.#rows; }
    get cols() { return this.#cols; }

    get width() { return (this.#cols) * this.#cellSize; }
    get height() { return (this.#rows) * this.#cellSize; }

    constructor() {
        this.rows = 20;
        this.cols = 20;
        this.cellSize = 40;
    }

    setCanvas(canvas) {
        this.#canvas = canvas;
        this.#ctx = canvas.getContext('2d');
        this.bgColor = 'teal';
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.addEventListener("click", this.#boardClick());
        canvas.addEventListener("mousemove", this.#boardMouseMove());
        this.drawBoard();
    }
    drawBoard() {
        this.#ctx.fillStyle = this.#bgColor;
        this.#ctx.fillRect(0, 0, this.width, this.height);
        this.#ctx.strokeStyle = 'black';
        this.#ctx.lineWidth = 1;
        this.#ctx.beginPath();
        for (let i = 0; i < this.#rows; i++) {
            this.#ctx.moveTo(this.#cellSize >> 1, Math.round((i + .5) * this.#cellSize));
            this.#ctx.lineTo(this.width - this.#cellSize * .5, (i + .5) * this.#cellSize);
        }
        for (let i = 0; i < this.#cols; i++) {
            this.#ctx.moveTo((i + .5) * this.#cellSize, this.#cellSize >> 1);
            this.#ctx.lineTo((i + .5) * this.#cellSize, this.height - this.#cellSize * .5);
        }
        this.#ctx.stroke();
    }
    drawCell(x, y) {
        if(x < 0 || x >= this.#cols || y < 0 || y >= this.#rows) return;
        this.#ctx.fillStyle = this.#bgColor;
        this.#ctx.fillRect(x * this.#cellSize, y * this.#cellSize, this.#cellSize, this.#cellSize);
        const xStartHelper = x == 0 ? .5 : x;
        const yStartHelper = y == 0 ? .5 : y;
        const xEndHelper = x == this.#cols - 1 ? x - .5 : x;
        const yEndHelper = y == this.#rows - 1 ? y - .5 : y;
        this.#ctx.beginPath();
        this.#ctx.moveTo(xStartHelper * this.#cellSize, (y + .5) * this.#cellSize);
        this.#ctx.lineTo((xEndHelper + 1) * this.#cellSize, (y + .5) * this.#cellSize);
        this.#ctx.moveTo((x + .5) * this.#cellSize, yStartHelper * this.#cellSize);
        this.#ctx.lineTo((x + .5) * this.#cellSize, (yEndHelper + 1) * this.#cellSize);
        this.#ctx.stroke();
    }

    drawPlace(x, y, color, text) {
        this.#ctx.fillStyle = color;
        this.#ctx.beginPath();
        this.#ctx.arc((x + .5) * this.#cellSize, (y + .5) * this.#cellSize, this.#cellSize * .35, 0, Math.PI * 2);
        this.#ctx.fill();
        this.#ctx.stroke();
        if (!text) return;
        this.#ctx.textAlign = "right";
        this.#ctx.fillStyle = "white";
        this.#ctx.strokeStyle = "black";
        const beforeLineWidth = this.#ctx.lineWidth;
        this.#ctx.lineWidth = 3;
        this.#ctx.strokeText(text, (x + .9) * this.#cellSize, (y + .9) * this.#cellSize);
        this.#ctx.fillText(text, (x + .9) * this.#cellSize, (y + .9) * this.#cellSize);
        this.#ctx.lineWidth = beforeLineWidth;
    }

    #boardClick() {
        return (e) => {
            const x = Math.floor(e.offsetX / this.#cellSize);
            const y = Math.floor(e.offsetY / this.#cellSize);
            this.#clickCallback(x, y);
        }
    }

    #boardMouseMove() {
        const pos = { x: 0, y: 0 };
        return (e) => {
            const x = Math.floor(e.offsetX / this.#cellSize);
            const y = Math.floor(e.offsetY / this.#cellSize);
            if (x != pos.x || y != pos.y) {
                this.#moveCallback(pos, x, y);
                pos.x = x;
                pos.y = y;
            }
        }
    }

    setMoveCallback(callback) {
        this.#moveCallback = callback;
    }

    setClickCallback(callback) {
        this.#clickCallback = callback;
    }
}

class BoardData {
    _width;
    _height;
    _board;
    constructor(width, height) {
        this._width = width;
        this._height = height;
        this.clear();
    }

    clear() {
        this._board = [];
        for (let i = 0; i < this._height; i++) {
            this._board[i] = [];
            for (let j = 0; j < this._width; j++) {
                this._board[i][j] = 0;
            }
        }
    }

    get(x, y) {
        if (x < 0 || x >= this._width || y < 0 || y >= this._height) return -9999;
        return this._board[y][x];
    }

    set(x, y, val) {
        return this._board[y][x] = val;
    }

    add(x, y, val) {
        return this._board[y][x] += val;
    }

    get board() { return this._board; }
    get width() { return this._width; }
    get height() { return this._height; }
}

class WeightData extends BoardData {
    constructor(width, height) {
        super(width, height);
    }

    clear() {
        this._board = [];
        for (let i = 0; i < this._height; i++) {
            this._board[i] = [];
        }
    }
}