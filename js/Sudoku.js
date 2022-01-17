const NUMBER_OF_BOARD_CELLS = 81;
const NUMBER_OF_ROWS_AND_COLS = Math.sqrt(NUMBER_OF_BOARD_CELLS);
const MAX_INTEGER = NUMBER_OF_ROWS_AND_COLS;

export default class Sudoko {
  constructor(parentElement, board) {
    this.board = board;
    this.parentElement = parentElement;
    this._validateBoard();
    this.cachedElements = [];
  }

  draw() {
    const listElement = document.createElement("ul");

    for (let row = 0; row < NUMBER_OF_ROWS_AND_COLS; row++) {
      for (let col = 0; col < NUMBER_OF_ROWS_AND_COLS; col++) {
        const item = document.createElement("li");

        item.innerHTML = "<span></span>";
        if (this.board[row][col] > 0) {
          item.innerHTML = "<span>" + this.board[row][col] + "</span>";
          item.classList.add("fixed");
        }
        item.setAttribute("row", row);
        item.setAttribute("column", col);
        listElement.append(item);

        this._cacheElement(row, col, item);
      }
    }

    this.parentElement.append(listElement);
  }

  async solve() {
    for (let row = 0; row < NUMBER_OF_ROWS_AND_COLS; row++) {
      for (let col = 0; col < NUMBER_OF_ROWS_AND_COLS; col++) {
        if (this.board[row][col] !== 0) {
          continue;
        }

        for (let numberToTry = 1; numberToTry <= MAX_INTEGER; numberToTry++) {
          await this._sleep();
          this._updateCell(row, col, numberToTry, "trying");

          if (!this._isNumberSafeToPlace(numberToTry, row, col)) {
            continue;
          }

          this._updateCell(row, col, numberToTry, "succes");
          this.board[row][col] = numberToTry;

          if (await this.solve()) {
            return true;
          } else {
            // Reset current cell and all cells after current cell.
            //this._updateCell(row, col, "", "empty");
            for(let rowToReset = row; rowToReset < NUMBER_OF_ROWS_AND_COLS; rowToReset++){
                for(let colToReset = col; colToReset < NUMBER_OF_ROWS_AND_COLS; colToReset++){
                    this._updateCell(rowToReset, colToReset, "", "empty");
                }
            }
            this.board[row][col] = 0;
          }
        }

        return false;
      }
    }

    return true;
  }

  getBoard() {
    return this.board;
  }

  _isNumberSafeToPlace(num, row, col) {
    return (
      !this._isNumberInRow(num, row) &&
      !this._isNumberInCol(num, col) &&
      !this._isNumberInBox(num, row, col)
    );
  }

  _isNumberInRow(num, row) {
    return this.board[row].indexOf(num) !== -1;
  }

  _isNumberInCol = (num, col) => {
    return this.board.some((row) => row[col] === num);
  };

  _isNumberInBox = (num, row, col) => {
    const boxStartRow = row - (row % 3);
    const boxStartCol = col - (col % 3);

    for (let i = boxStartRow; i < boxStartRow + 3; i++) {
      for (let j = boxStartCol; j < boxStartCol + 3; j++) {
        if (this.board[i][j] === num) {
          return true;
        }
      }
    }
    return false;
  };

  _cacheElement(row, col, element) {
    if (!Array.isArray(this.cachedElements[row])) {
      this.cachedElements[row] = [];
    }
    this.cachedElements[row][col] = element;
  }

  _getElement(row, col) {
    return this.cachedElements[row][col];
  }

  _sleep() {
    return new Promise((resolve) => setTimeout(resolve, 10));
  }

  _updateCell(row, col, text, status) {
    const cell = this._getElement(row, col);
    if(cell.classList.contains('fixed')){
        return;
    }
    cell.removeAttribute("class");

    cell.innerText = text;
    cell.classList.add(status);
  }

  _validateBoard() {
    // @TODO.
  }
}
