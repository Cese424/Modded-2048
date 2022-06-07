import Grid, {
  PRICE
} from "./Grid.js"
import Tile from "./Tile.js"

const gameBoard = document.getElementById("game-board")

if (typeof (Storage) !== "undefined") {
  if (localStorage.getItem("bestScoreSaved") != null) {
    document.getElementById("hightScore").innerHTML = localStorage.getItem("bestScoreSaved");
  } else {
    document.getElementById("hightScore").innerHTML = 0
  }
} else {
  document.getElementById("hightScore").innerHTML = 0
}

const grid = new Grid(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
grid.randomEmptyCell().tile = new Tile(gameBoard)
setupInput()

  ! function (t, e) {
    "use strict";
    "function" != typeof t.CustomEvent && (t.CustomEvent = function (t, n) {
      n = n || {
        bubbles: !1,
        cancelable: !1,
        detail: void 0
      };
      var a = e.createEvent("CustomEvent");
      return a.initCustomEvent(t, n.bubbles, n.cancelable, n.detail), a
    }, t.CustomEvent.prototype = t.Event.prototype), e.addEventListener("touchstart", function (t) {
      if ("true" === t.target.getAttribute("data-swipe-ignore")) return;
      s = t.target, r = Date.now(), n = t.touches[0].clientX, a = t.touches[0].clientY, u = 0, i = 0
    }, !1), e.addEventListener("touchmove", function (t) {
      if (!n || !a) return;
      var e = t.touches[0].clientX,
        r = t.touches[0].clientY;
      u = n - e, i = a - r
    }, !1), e.addEventListener("touchend", function (t) {
      if (s !== t.target) return;
      var e = parseInt(l(s, "data-swipe-threshold", "20"), 10),
        o = parseInt(l(s, "data-swipe-timeout", "500"), 10),
        c = Date.now() - r,
        d = "",
        p = t.changedTouches || t.touches || [];
      Math.abs(u) > Math.abs(i) ? Math.abs(u) > e && c < o && (d = u > 0 ? "swiped-left" : "swiped-right") : Math.abs(i) > e && c < o && (d = i > 0 ? "swiped-up" : "swiped-down");
      if ("" !== d) {
        var b = {
          dir: d.replace(/swiped-/, ""),
          touchType: (p[0] || {}).touchType || "direct",
          xStart: parseInt(n, 10),
          xEnd: parseInt((p[0] || {}).clientX || -1, 10),
          yStart: parseInt(a, 10),
          yEnd: parseInt((p[0] || {}).clientY || -1, 10)
        };
        s.dispatchEvent(new CustomEvent("swiped", {
          bubbles: !0,
          cancelable: !0,
          detail: b
        })), s.dispatchEvent(new CustomEvent(d, {
          bubbles: !0,
          cancelable: !0,
          detail: b
        }))
      }
      n = null, a = null, r = null
    }, !1);
    var n = null,
      a = null,
      u = null,
      i = null,
      r = null,
      s = null;

    function l(t, n, a) {
      for (; t && t !== e.documentElement;) {
        var u = t.getAttribute(n);
        if (u) return u;
        t = t.parentNode
      }
      return a
    }
  }(window, document);

function setupInput() {

  document.addEventListener('swiped', handleInput, {
    once: true
    //"e.target" --> element that was swiped
    //"e.detail.dir" --> swipe direction
  });

}

async function handleInput(e) {
  if (e.target == document.querySelector('.swipeArea')) {
    switch (e.detail.dir) {
      case "up":
        if (!canMoveUp()) {
          setupInput()
          return
        }
        await moveUp()
        break
      case "down":
        if (!canMoveDown()) {
          setupInput()
          return
        }
        await moveDown()
        break
      case "left":
        if (!canMoveLeft()) {
          setupInput()
          return
        }
        await moveLeft()
        break
      case "right":
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
    
    if (grid.randomEmptyCell() != null) {

      const newTile2 = new Tile(gameBoard)
      grid.randomEmptyCell().tile = newTile2
  
      if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        newTile2.waitForTransition(true).then(() => {
          moddedGameOver()
        })
        return
      }
    }
  }
    
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

  document.getElementById("gameEnd").style.zIndex = 100;

  document.getElementById("gameEnd").className = "gameEndAnim";

  document.getElementById("titleScore").className += "titleScore";

  document.getElementById("gameOverScore").innerHTML = score

  document.getElementById("retry").onclick = function () {
    history.go(0)
  }

  if (score >= document.getElementById("hightScore").innerHTML) {
    if (typeof (Storage) !== "undefined") {
      localStorage.setItem("bestScoreSaved", score)
    } else {
      return
    }
    document.getElementById("hightScore").innerHTML = score
  }


}

//define the final message based on your score
function defineTitleScore() {
  var titlesScore;
  const titles = ["You are wasting my time", "You are too bad", "Oof", "Bad", "Uhh", "Not that bad", "Close to good", "Good", "Wow", "Awsome", "Perfect", "WTF?", "STOP!!!", "Are you god???", "Ok, im done!"]

  if (score < 30) {
    titlesScore = titles[0]
  } else if (score < 60) {
    titlesScore = titles[1]
  } else if (score < 90) {
    titlesScore = titles[2]
  } else if (score < 135) {
    titlesScore = titles[3]
  } else if (score < 200) {
    titlesScore = titles[4]
  } else if (score < 300) {
    titlesScore = titles[5]
  } else if (score < 400) {
    titlesScore = titles[6]
  } else if (score < 500) {
    titlesScore = titles[7]
  } else if (score < 700) {
    titlesScore = titles[8]
  } else if (score < 800) {
    titlesScore = titles[9]
  } else if (score < 950) {
    titlesScore = titles[10]
  } else if (score < 1150) {
    titlesScore = titles[11]
  } else if (score < 1400) {
    titlesScore = titles[12]
  } else if (score < 1650) {
    titlesScore = titles[13]
  } else if (score > 1650) {
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
  if (oldprice != PRICE) {
    oldprice = oldprice * 2

    if (PRICE <= 64) {
      rounds = Math.floor(PRICE / 1.5)
      dificulty.innerHTML = "easy"
      dificulty.style.color = "#19A328"
    } else if (PRICE == 128) {
      rounds = 60
      dificulty.innerHTML = "medium"
      dificulty.style.color = "#FFCC00"
    } else if (PRICE == 256) {
      rounds = 90
      dificulty.innerHTML = "medium"
      dificulty.style.color = "#FFCC00"
    } else if (PRICE == 512) {
      rounds = 160
      dificulty.innerHTML = "medium"
      dificulty.style.color = "#FFCC00"
    } else if (PRICE == 1024) {
      rounds = 240
      dificulty.innerHTML = "hard"
      dificulty.style.color = "#a80f0f"
    } else if (PRICE == 2048) {
      rounds = 400
      dificulty.innerHTML = "impossible"
      dificulty.style.color = "#640ba3"
    } else if (PRICE == 4096) {
      rounds = 700
      dificulty.innerHTML = "impossible"
      dificulty.style.color = "#640ba3"
    } else if (PRICE >= 8192) {
      rounds = Math.floor(PRICE / 7)
      dificulty.innerHTML = "impossible"
      dificulty.style.color = "#640ba3"
    }
  }
}