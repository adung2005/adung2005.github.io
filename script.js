const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

let image1 = new Image();
let inputFile = document.getElementById('inputFile');

inputFile.onchange = function () {
    image1.src = URL.createObjectURL(inputFile.files[0]);
};
const inputSlider = document.getElementById('resolution');
const inputLabel = document.getElementById('resolutionLabel');

inputSlider.oninput = function () {
    if (inputSlider.value == 1) {
        inputLabel.innerHTML = 'Original Image';
        ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);
    } else {
        inputLabel.innerHTML = 'Resolution: ' + inputSlider.value + 'px';
        ctx.font = parseInt(inputSlider.value) * 1.2 + 'px Verdana';
        effect.draw(parseInt(inputSlider.value));
    }
};

class Cell {
    constructor(x, y, symbol, color) {
        this.x = x;
        this.y = y;
        this.symbol = symbol;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillText(this.symbol, this.x, this.y);
    }
}

class AsciiEffect {
    #imageCellArray = [];
    #sympols = [];
    #pixels = [];
    #ctx;
    #height;
    #width;
    constructor(ctx, width, height) {
        this.#ctx = ctx;
        this.#width = width;
        this.#height = height;
        this.#ctx.drawImage(image1, 0, 0, this.#width, this.#height);
        this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
    }
    #convertToSymbol(avg) {
        if (avg > 240) return 'Ñ';
        else if (avg > 230) return '@';
        else if (avg > 215) return '9';
        else if (avg > 180) return '5';
        else if (avg > 144) return '1';
        else if (avg > 108) return 'a';
        else if (avg > 73) return ':';
        else if (avg > 20) return '.';
        else return '';
    }

    #scanImage(cellSize) {
        this.#imageCellArray = [];
        for (let i = 0; i < this.#pixels.height; i += cellSize) {
            for (let j = 0; j < this.#pixels.width; j += cellSize) {
                const posX = i * 4;
                const posY = j * 4;
                const pos = posY * this.#pixels.height + posX;

                if (this.#pixels.data[pos + 3] > 128) {
                    const r = this.#pixels.data[pos];
                    const g = this.#pixels.data[pos + 1];
                    const b = this.#pixels.data[pos + 2];
                    const total = r + g + b;
                    const avg = total / 3;
                    const color = 'rgb(' + r + ',' + g + ',' + b + ')';
                    const symbol = this.#convertToSymbol(avg);

                    this.#imageCellArray.push(new Cell(i, j, symbol, color));
                }
            }
        }
    }
    #drawAscii() {
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
        for (let i = 0; i < this.#imageCellArray.length; i++) {
            this.#imageCellArray[i].draw(this.#ctx);
        }
    }
    draw(cellSize) {
        this.#scanImage(cellSize);
        this.#drawAscii();
    }
}
let effect;

image1.onload = function initialize() {
    canvas.width = image1.width;
    canvas.height = image1.height;
    // ctx.drawImage(image1, 0, 0);
    effect = new AsciiEffect(ctx, image1.width, image1.height);
};
