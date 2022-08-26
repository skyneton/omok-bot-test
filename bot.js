const Bot = new class {
    #player = [];
    #bot = [];
    #botValue = 2;
    #targetValue = 1;
    #vectorList = ["1,0", "-1,0", "0,1", "0,-1", "1,1", "-1,-1", "1,-1", "-1,1"];
    #minDefence = 3;

    addEnemyPos(x, y) {
        this.#player.push([x, y]);
    }

    addBotPos(x, y) {
        this.#bot.push([x, y]);
    }

    #randomPos(boardData) {
        const width = boardData.width,
            height = boardData.height;
        while (true) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            if (boardData.get(x, y) == 0) return {"depth": 0, "pos": [[x, y], 1]};
        }
    }

    #getWeightPos(weightArray) {
        const lastArray = [];
        weightArray.sort((a, b) => b.depth - a.depth).map(item => {
            item.arr.sort((a, b) => b[1] - a[1]);
            item.arr.length > 0 && item.arr[0][1] >= 4 && lastArray.push([item.arr[0], item.depth]);
        });
        if(lastArray.length > 0) return { "depth": lastArray[0][1], "pos": lastArray[0][0] };
        for (const index in weightArray) {
            const depthArray = weightArray[index],
                nextArray = weightArray[index + 1];
            if ((depthArray?.arr.length ?? 0) <= 0) continue;
            if ((nextArray?.arr.length ?? 0) > 0 && nextArray.depth >= this.#minDefence && nextArray.arr[0][1] > depthArray.arr[0][1])
                return { "depth": nextArray.depth, "pos": nextArray.arr[0] };
            return { "depth": depthArray.depth, "pos": depthArray.arr[0] };
        }
    }

    think(boardData) {
        const defenceWeightArray = this.#loopCalc(this.#player, boardData, this.#targetValue, true);
        const defencePosData = this.#getWeightPos(defenceWeightArray);

        const attackWeightArray = this.#loopCalc(this.#bot, boardData, this.#botValue);
        const attackPosData = this.#getWeightPos(attackWeightArray);

        if (attackPosData?.pos[1] == 4) return attackPosData;
        console.log(defencePosData, defenceWeightArray);
        return defencePosData.depth >= 3
            ? defencePosData
            : attackPosData
                ? attackPosData
                : this.#randomPos(boardData);
    }

    #loopCalc(placedPos, boardData, target, save = false) {
        const weightArray = [];
        const visited = new BoardData(boardData.width, boardData.height);
        const weight = new WeightData(boardData.width, boardData.height);
        if (save) window.weight = weight;
        if (save) window.visited = visited;

        for (const pos of placedPos) {
            this.#calc(pos, boardData, weightArray, weight, visited, target);
        }

        return weightArray;
    }

    #calc(pos, boardData, weightArray, weight, visited, id) {
        const x = pos[0], y = pos[1];
        this.#calcVector(x, y, id, boardData, weightArray, weight, visited, "0,0");
    }

    #calcVector(x, y, id, boardData, weightArray, weight, visited, vector, depth = 0) {
        if (vector == "0,0") {
            const data = {};
            visited.set(x, y, data);
            depth++;
            for (const currentVector of this.#vectorList) {
                const direction = currentVector.split(",").map(item => Math.floor(item));

                // all direction check
                data[currentVector] = this.#calcVector(
                    x + direction[0],
                    y + direction[1],
                    id, boardData, weightArray, weight, visited,
                    currentVector,
                    0);
            }
            this.#calcLine(boardData, weightArray, weight, data["1,0"], data["-1,0"], 0);
            this.#calcLine(boardData, weightArray, weight, data["0,1"], data["0,-1"], 1);
            this.#calcLine(boardData, weightArray, weight, data["1,1"], data["-1,-1"], 2);
            this.#calcLine(boardData, weightArray, weight, data["1,-1"], data["-1,1"], 3);
            return;
        }
        const visitedData = visited.get(x, y) ? visited.get(x, y) : visited.set(x, y, {});
        if (visitedData[vector]) {
            // already checked.
            return;
        }
        if (x < 0 || x >= boardData.width || y < 0 || y >= boardData.height
            || boardData.get(x, y) != id) {
            return [[x, y], depth];
        }
        const direction = vector.split(",").map(item => Math.floor(item));
        return visitedData[vector] = this.#calcVector(
            x + direction[0],
            y + direction[1],
            id, boardData, weightArray, weight, visited, vector, depth + 1);
    }

    #calcLine(boardData, weightArray, weight, v1, v2, type) {
        if (!Array.isArray(v1) || !Array.isArray(v2)) return;
        let depth = v1[1] + v2[1] + 1;
        const real = depth;
        const ax = v1[0][0], ay = v1[0][1];
        const bx = v2[0][0], by = v2[0][1];
        if (boardData.get(ax, ay) != 0 && boardData.get(bx, by) != 0) return;
        if (boardData.get(ax, ay) == 0 && boardData.get(bx, by) == 0) depth++;
        if (boardData.get(ax, ay) == 0) {
            const beforeWeightData = weight.get(ax, ay) ?? {};
            beforeWeightData[type] ??= { "depth": 0, "real": 0 };
            const nowDepth = beforeWeightData[type].depth += depth;
            const nowReal = beforeWeightData[type].real += real;
            if (!beforeWeightData["last"]) {
                beforeWeightData["last"] = { type, "plus": 0 };
                this.#add(weightArray, nowDepth, v1[0], nowReal);
            } else {
                const last = beforeWeightData["last"];
                const beforeDepth = beforeWeightData[last.type].depth + last.plus;
                if (beforeWeightData[last.type].depth < nowDepth) {
                    last.type = type;
                }
                last.plus = (Object.keys(last).length - 1) * .03;
                this.#remove(weightArray, beforeDepth, v1[0]);
                this.#add(weightArray, beforeWeightData[last.type].depth + last.plus, v1[0], nowReal);
            }
            weight.set(ax, ay, beforeWeightData);
        }
        if (boardData.get(bx, by) == 0) {
            const beforeWeightData = weight.get(bx, by) ?? {};
            beforeWeightData[type] ??= { "depth": 0, "real": 0 };
            const nowDepth = beforeWeightData[type].depth += depth;
            const nowReal = beforeWeightData[type].real += real;
            if (!beforeWeightData["last"]) {
                beforeWeightData["last"] = { type, "plus": 0 };
                this.#add(weightArray, nowDepth, v2[0], nowReal);
            } else {
                const last = beforeWeightData["last"];
                const beforeDepth = beforeWeightData[last.type].depth + last.plus;
                if (beforeWeightData[last.type].depth < nowDepth) {
                    last.type = type;
                }
                last.plus = (Object.keys(last).length - 1) * .03;
                this.#remove(weightArray, beforeDepth, v2[0]);
                this.#add(weightArray, beforeWeightData[last.type].depth + last.plus, v2[0], nowReal);
            }
            weight.set(bx, by, beforeWeightData);
        }
    }

    #add(weightArray, depth, pos, real) {
        for (const depthArray of weightArray) {
            if (depthArray.depth == depth) {
                depthArray.arr.push([pos, real]);
                return;
            }
        }
        weightArray.push({ depth, "arr": [[pos, real]] });
    }

    #remove(weightArray, depth, pos) {
        for (const depthArray of weightArray) {
            if (depthArray.depth == depth) {
                const lastIndex = depthArray.arr.length - 1;
                for (let i = 0; i < lastIndex; i++)
                {
                    if (depthArray.arr[i][0][0] == pos[0] && depthArray.arr[i][0][1] == pos[1]) {
                        const lastData = depthArray.arr.pop();
                        if (i < lastIndex)
                            depthArray.arr[i] = lastData;
                        return;
                    }
                }
                return;
            }
        }
    }
}