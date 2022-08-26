const Play = new class {
    #board;
    #boardData;
    constructor() {
        this.#board = new Board();
        this.#board.rows = 15;
        this.#board.cols = 15;
        this.#board.cellSize = 40;
        this.#board.bgColor = 'teal';

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
            this.#board.drawPlace(x, y, "black");
            Bot.addEnemyPos(x, y);
            const botResult = Bot.think(this.#boardData);
            this.#boardData.set(botResult.pos[0][0], botResult.pos[0][1], 2);
            this.#board.drawPlace(botResult.pos[0][0], botResult.pos[0][1], "white");
            Bot.addBotPos(botResult.pos[0][0], botResult.pos[0][1]);
        }
    }
}
