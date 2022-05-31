import Grid, {PRICE} from "./Grid.js"
import Tile from "./Tile.js"

const gameBoard = document.getElementById("game-board")


const grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
setupInput()

function setupInput() {
  window.addEventListener("keydown", handleInput, {
    once: true
  })

}

async function handleInput(e) {
  switch (e.key) {
    case "ArrowUp":
    case "w":
      if (!canMoveUp()) {
        setupInput()
        return
      }
      await moveUp()
      break
    case "ArrowDown":
    case "s":
      if (!canMoveDown()) {
        setupInput()
        return
      }
      await moveDown()
      break
    case "ArrowLeft":
    case "a":
      if (!canMoveLeft()) {
        setupInput()
        return
      }
      await moveLeft()
      break
    case "ArrowRight":
    case "d":
      if (!canMoveRight()) {
        setupInput()
        return
      }
      await moveRight()
      break
    default:
      setupInput()
      return
  }

  grid.cells.forEach(cell => cell.mergeTiles())

  const newTile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = newTile
  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      moddedGameOver()
    })
    return
  }

  // const newTile2 = new Tile(gameBoard)
  // grid.randomEmptyCell().tile = newTile2
  // if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
  //   newTile2.waitForTransition(true).then(() => {
  //     moddedGameOver()
  //   })
  //   return
  // }

  setupInput()
}

function moveUp() {
  gameMod()
  return slideTiles(grid.cellsByColumn)
}

function moveDown() {
  gameMod()
  return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
  gameMod()
  return slideTiles(grid.cellsByRow)
}

function moveRight() {
  gameMod()
  return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
  return Promise.all(
    cells.flatMap(group => {
      const promises = []
      for (let i = 1; i < group.length; i++) {
        const cell = group[i]
        if (cell.tile == null) continue
        let lastValidCell
        for (let j = i - 1; j >= 0; j--) {
          const moveToCell = group[j]
          if (!moveToCell.canAccept(cell.tile)) break
          lastValidCell = moveToCell
        }

        if (lastValidCell != null) {
          promises.push(cell.tile.waitForTransition())
          if (lastValidCell.tile != null) {
            lastValidCell.mergeTile = cell.tile
          } else {
            lastValidCell.tile = cell.tile
          }
          cell.tile = null
        }
      }
      return promises
    })
  )
}

function canMoveUp() {
  return canMove(grid.cellsByColumn)
}

function canMoveDown() {
  return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
  return canMove(grid.cellsByRow)
}

function canMoveRight() {
  return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells) {
  return cells.some(group => {
    return group.some((cell, index) => {
      if (index === 0) return false
      if (cell.tile == null) return false
      const moveToCell = group[index - 1]
      return moveToCell.canAccept(cell.tile)
    })
  })
}

let score = 0
const scoreId = document.getElementById("score")
const priceId = document.getElementById("price")
const roundsId = document.getElementById("roundsLeft")

let rounds = 20

function gameMod() {
  score = score + 1
  rounds = rounds - 1

  questConfig()

  scoreId.innerHTML = score
  priceId.innerHTML = PRICE
  roundsId.innerHTML = rounds

  if (rounds <= 0) {
    moddedGameOver()
    return
  }
}

//Game over function
function moddedGameOver() {

  var destroySetupInput = function () {
    setupInput = function () {
      return;
    };
  }
  destroySetupInput()

  defineTitleScore()

  document.getElementById("gameEnd").style.zIndex = 3

  document.getElementById("gameEnd").className = "gameEndAnim";

  document.getElementById("titleScore").className += "titleScore";

  document.getElementById("gameOverScore").innerHTML = score

  document.getElementById("retry").onclick = function () {
    history.go(0)
  }


}

//define the final message based on your score
function defineTitleScore() {
  var titlesScore;
  const titles = ["You are wasting my time", "You are too bad", "Oof", "Bad", "Meh", "Hmm", "Uh", "Good", "Wow", "Awsome", "Perfect", "WTF?", "STOP!!!", "Are you god???", "Ok, im done!"]

  if (score < 30) {
    titlesScore = titles[0]
  } else if (score < 60) {
    titlesScore = titles[1]
  } else if (score < 120) {
    titlesScore = titles[2]
  } else if (score < 200) {
    titlesScore = titles[3]
  } else if (score < 300) {
    titlesScore = titles[4]
  } else if (score < 400) {
    titlesScore = titles[5]
  } else if (score < 500) {
    titlesScore = titles[6]
  } else if (score < 600) {
    titlesScore = titles[7]
  } else if (score < 750) {
    titlesScore = titles[8]
  } else if (score < 900) {
    titlesScore = titles[9]
  } else if (score < 1200) {
    titlesScore = titles[10]
  } else if (score < 1700) {
    titlesScore = titles[11]
  } else if (score < 2000) {
    titlesScore = titles[12]
  } else if (score < 2700) {
    titlesScore = titles[13]
  } else if (score > 2700) {
    titlesScore = titles[14]
  }

  let style = document.createElement('style');
  style.innerHTML = ':root { --over-title: ' + '"' + titlesScore + '"' + '; }';
  document.head.appendChild(style);
}

//convert new price in rounds "currency"
var oldprice = 16
const dificulty = document.getElementById("dificultyLevel");
function questConfig() {
  if (oldprice != PRICE){
    oldprice = oldprice * 2

    if (PRICE <= 64) {
      rounds = PRICE
      dificulty.innerHTML = "easy"
      dificulty.style.color = "#19A328"
    }
    else if (PRICE == 128) {
      rounds = Math.floor(PRICE / 1.7)
      dificulty.innerHTML = "medium"
      dificulty.style.color = "#FFCC00"
    }
    else if (PRICE <= 512) {
      rounds = Math.floor(PRICE / 2)
      dificulty.innerHTML = "medium"
      dificulty.style.color = "#FFCC00"
    }
    else if (PRICE == 1024) {
      rounds = Math.floor(PRICE / 3)
      dificulty.innerHTML = "hard"
      dificulty.style.color = "#a80f0f"
    }
    else if (PRICE > 1024) {
      rounds = Math.floor(PRICE / 4.5)
      dificulty.innerHTML = "impossible"
      dificulty.style.color = "#640ba3"
    }
  }
}
