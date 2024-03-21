const Play = new class {
    #board;
    #boardData;
    #count = 0;
    constructor() {
        this.#board = new Board();
        window.board = this.#board;
        this.#board.rows = 15;
        this.#board.cols = 15;
        this.#board.cellSize = 40;
        this.#board.bgColor = '#D49160';

        this.#boardData = new BoardData(this.#board.cols, this.#board.rows);
        this.#board.setCanvas(document.getElementsByTagName("canvas")[0]);
        this.#board.setMoveCallback(this.#boardMove());
        this.#board.setClickCallback(this.#boardClick());
    }

    #boardMove() {
        return (before, x, y) => {
            if(this.#boardData.get(before.x, before.y) == 0) this.#board.drawCell(before.x, before.y);
            if (this.#boardData.get(x, y) != 0) return;
            this.#board.drawPlace(x, y, "rgba(90, 90, 90, .7)");
            document.getElementsByTagName("div")[0].innerText = `${x}, ${y}`;
        }
    }

    #boardClick() {
        return (x, y) => {
            if (this.#boardData.get(x, y) != 0) return;
            this.#boardData.set(x, y, 1);
            this.#board.drawPlace(x, y, "black", ++this.#count);
            if (this.#gameEndCheck(x, y)) {
                alert("You win!");
            }
            Bot.addEnemyPos(x, y);
            const botResult = Bot.think(this.#boardData);
            this.#boardData.set(botResult.pos[0][0], botResult.pos[0][1], 2);
            this.#board.drawPlace(botResult.pos[0][0], botResult.pos[0][1], "white", ++this.#count);
            Bot.addBotPos(botResult.pos[0][0], botResult.pos[0][1]);
            if (this.#gameEndCheck(botResult.pos[0][0], botResult.pos[0][1])) {
                alert("You lose!");
            }
        }
    }

    #gameEndCheck(x, y) {
        const type = this.#boardData.get(x, y);
        const horizontal = this.#countVector(x + 1, y, "1,0", type) + this.#countVector(x - 1, y, "-1,0", type) + 1;
        if(horizontal >= 5) return true;
        const vertical = this.#countVector(x, y + 1, "0,1", type) + this.#countVector(x, y - 1, "0,-1", type) + 1;
        if(vertical >= 5) return true;
        const diagonal = this.#countVector(x + 1, y + 1, "1,1", type) + this.#countVector(x - 1, y - 1, "-1,-1", type) + 1;
        if(diagonal >= 5) return true;
        const diagonal2 = this.#countVector(x + 1, y - 1, "1,-1", type) + this.#countVector(x - 1, y + 1, "-1,1", type) + 1;
        if (diagonal2 >= 5) return true;
        return false;
    }

    /**
     * 
     * @param {Int} x 
     * @param {Int} y 
     * @param {string} vector 
     * @param {Int} type 
     */
    #countVector(x, y, vector, type, count = 0) {
        if(count > 5 || this.#boardData.get(x, y) != type) return count;
        const direction = vector.split(",").map(item => Math.floor(item));
        return this.#countVector(x + direction[0], y + direction[1], vector, type, count + 1);
    }
}
