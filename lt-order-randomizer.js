let names = [];
let movingNames = [];
let slots = [];
let input, button, startButton, speedUpButton;
let isMoving = false;
let slotWidth = 200;
let slotHeight = 100;
let slotGap = 220;
let speedMultiplier = 1;
let animationSpeed = 0.05;
let fireworks = [];

function setup() {
  createCanvas(1000, 600);
  background(240);

  // 名前入力フィールド
  input = createInput();
  input.position(20, 20);

  // 追加ボタン
  button = createButton('Add Name');
  button.position(input.x + input.width + 10, 20);
  button.mousePressed(addName);

  // STARTボタン
  startButton = createButton('START');
  startButton.position(20, 60);
  startButton.mousePressed(startMoving);

  // スピードアップボタン
  speedUpButton = createButton('Speed Up');
  speedUpButton.position(startButton.x + startButton.width + 10, 60);
  speedUpButton.mousePressed(speedUp);

  textAlign(CENTER, CENTER);
  textSize(24); // 名前のフォントサイズ
}

// 名前を追加する関数
function addName() {
  let name = input.value();
  if (name !== "") {
    names.push(name);
    movingNames.push(new MovingName(name)); // 動く名前オブジェクトを作成
    input.value(''); // 入力欄をクリア
  }
}

// エンターキーで名前を追加
function keyPressed() {
  if (keyCode === ENTER) {
    addName();
  }
}

// ランダムな動きをスタート
function startMoving() {
  if (names.length > 0) {
    isMoving = true;
    slots = [];
    createSlots();
    speedMultiplier = 2;
  }
}

// スピードアップボタン
function speedUp() {
  speedMultiplier *= 1.5;
}

// 枠を作成
function createSlots() {
  let xStart = 100;
  let yStart = 400;

  for (let i = 0; i < names.length; i++) {
    let x = xStart + i * slotGap;
    let y = yStart;
    slots.push(new Slot(x, y, i + 1));
  }
}

// 動く名前オブジェクト
class MovingName {
  constructor(name) {
    this.name = name;
    this.x = random(width);
    this.y = random(height - 200);
    this.vx = random(-5, 5);
    this.vy = random(-5, 5);
    this.isPlaced = false;
    this.r = 50;
    this.scale = 1;
    this.isHeadingToLastSlot = false;
    this.isFollowingMouse = false; // マウスを追尾するかどうか
  }

  move() {
    if (this.isFollowingMouse) {
      this.x = mouseX; // マウスのX座標に追尾
      this.y = mouseY; // マウスのY座標に追尾
    } else if (!this.isPlaced) {
      // 1枠だけ空いている場合は、その枠に向かって移動
      if (this.isHeadingToLastSlot) {
        let targetSlot = getLastEmptySlot();
        let dirX = targetSlot.x - this.x;
        let dirY = targetSlot.y - this.y;
        let dist = sqrt(dirX * dirX + dirY * dirY);
        this.vx = (dirX / dist) * 5;
        this.vy = (dirY / dist) * 5;
      }

      this.x += this.vx * speedMultiplier;
      this.y += this.vy * speedMultiplier;
      // 壁でバウンド
      if (this.x - this.r < 0 || this.x + this.r > width) {
        this.vx *= -1;
      }
      if (this.y - this.r < 0 || this.y + this.r > height - 100) {
        this.vy *= -1;
      }
    }
  }

  checkCollision(slot) {
    let threshold = 15;
    if (
      !this.isPlaced && !slot.isOccupied &&
      abs(this.x - slot.x) < threshold &&
      abs(this.y - slot.y) < threshold
    ) {
      this.isPlaced = true;
      slot.isOccupied = true;
      this.x = slot.x;
      this.y = slot.y;
      this.startAnimation();
      fireworks.push(new Firework(this.x, this.y));  // 花火の演出
      increaseSpeed();
    }
  }

  startAnimation() {
    this.scale = 1.5; // 拡大する
    setTimeout(() => {
      this.scale = 1; // すぐに縮小する
    }, 200); // 200ミリ秒後に縮小
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.scale);
    text(this.name, 0, 0);
    pop();
  }

    // マウスが押されたとき
    mousePressed() {
      this.isFollowingMouse = true; // マウスの動きを追尾
    }
  
    // マウスが離されたとき
    mouseReleased() {
      this.isFollowingMouse = false; // 追尾を終了

    }
}
// 花火クラス
class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    for (let i = 0; i < 100; i++) {
      this.particles.push(new Particle(this.x, this.y));
    }
  }

  display() {
    for (let p of this.particles) {
      p.update();
      p.show();
    }
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    this.alpha = 255;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5;
  }

  show() {
    noStroke();
    fill(255, this.alpha);
    ellipse(this.x, this.y, 8);
  }
}

// 枠クラス
class Slot {
  constructor(x, y, number) {
    this.x = x;
    this.y = y;
    this.number = number;
    this.isOccupied = false;
  }

  display() {
    stroke(0);
    noFill();
    rect(this.x - slotWidth / 2, this.y - slotHeight / 2, slotWidth, slotHeight);
    fill(0);
    text(this.number, this.x, this.y - slotHeight / 2 - 20);
  }
}

function increaseSpeed() {
  speedMultiplier *= 1.2;
}

// 空いている最後の枠を取得する
function getLastEmptySlot() {
  for (let slot of slots) {
    if (!slot.isOccupied) {
      return slot;
    }
  }
  return null;
}

function draw() {
  background(240);

  // 枠を描画
  for (let slot of slots) {
    slot.display();
  }

  // 名前を動かす
  if (isMoving) {
    let allPlaced = true;

    let unplacedNames = movingNames.filter(nameObj => !nameObj.isPlaced);
    if (unplacedNames.length === 1) {
      unplacedNames[0].isHeadingToLastSlot = true;
    }

    for (let nameObj of movingNames) {
      nameObj.move();
      nameObj.display();

      for (let slot of slots) {
        nameObj.checkCollision(slot);
      }

      if (!nameObj.isPlaced) {
        allPlaced = false;
      }
    }

    if (allPlaced) {
      isMoving = true; // 全ての名前がハマった際に動きを止めない
    }
  }

  // 花火を描画
  for (let firework of fireworks) {
    firework.display();
  }
  // クリックされた名前オブジェクトの追尾処理
  for (let nameObj of movingNames) {
    if (mouseIsPressed && dist(mouseX, mouseY, nameObj.x, nameObj.y) < nameObj.r) {
      nameObj.mousePressed();
    } else {
      nameObj.mouseReleased();
    }
  }
  if (!isMoving) {
    for (let nameObj of movingNames) {
      nameObj.display(); // 動かない名前オブジェクトを再描画
    }
  }
}
