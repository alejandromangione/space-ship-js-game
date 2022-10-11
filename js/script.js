window.addEventListener('load', () => {

  /*
   * Canvas Setup
   */
  window.debug = false;

  const canvas = document.querySelector("#canvas1");
  const ctx = canvas.getContext('2d');

  canvas.width = 500;
  canvas.height = 500;

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    // Clear sreeen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.update(deltaTime);
    game.draw(ctx);

    requestAnimationFrame(animate);
  }

  // Start game
  animate(0);
});

/*
 * Classes
 */

class InputHandler {
  constructor(game) {
    this.game = game;

    window.addEventListener('keydown', (e) => {
      if(window.debug) console.log(game, e)

      switch(e.key) {
        case 'ArrowLeft':
          if(this.game.keys.indexOf(e.key) === -1) this.game.keys.push(e.key);
          break;
        case 'ArrowRight':
          if(this.game.keys.indexOf(e.key) === -1) this.game.keys.push(e.key);
          break;
        case ' ':
          this.game.player.shootTop();
          break;
      }
    })

    window.addEventListener('keyup', (e) => {
      if(this.game.keys.includes(e.key)) {
        this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
      }
    })
  }
}

class Projectile {
  constructor(game, x, y) {
    this.game = game;
    this.x    = x;
    this.y    = y;

    this.width  = 3;
    this.height = 10;
    this.speed  = 3;
    this.markForDeletion = false;
  }

  update() {
    this.y -= this.speed;

    if(this.y < 0) this.markForDeletion = true;
  }

  draw(context){
    context.fillStyle = 'yellow';
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Particle {
  constructor() {
  }
}

class Player {
  constructor(game) {
    this.game = game;

    this.width  = 36;
    this.height = 36;
    this.x      = (game.width / 2) - (this.width / 2);
    this.y      = game.height - 75;

    this.frameX = 1;
    this.frameY = 0;

    // this.speedY   = 0;
    this.speedX   = 0;
    this.maxSpeed = 4;
    this.projetiles = [];
    this.image = document.querySelector("#player");
  }

  update() {
    if(this.game.keys.includes('ArrowLeft')) {
      this.speedX = -this.maxSpeed
      this.frameX = 0;
    }
    else if (this.game.keys.includes('ArrowRight')) {
      this.speedX = this.maxSpeed;
      this.frameX = 2;
    }
    else {
      this.speedX = 0;
      this.frameX = 1;
    }

    // this.y += this.speedY;
    this.x += this.speedX;

    // handle projetiles
    this.projetiles.forEach(p => {
      p.update();
    });

    this.projetiles = this.projetiles.filter(projetile => !projetile.markForDeletion)
  }

  draw(context) {
    if(window.debug) {
      context.fillStyle = 'yellow';
      context.fillRect(this.x, this.y, this.width, this.height);
    }

    context.drawImage(
      this.image,
      this.frameX * this.width,
      this.frameY * this.height,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    )

    // handle projetiles
    this.projetiles.forEach(p => {
      p.draw(context);
    });
  }

  shootTop() {
    if(this.game.ammo > 0)
      this.projetiles.push(new Projectile(this.game, this.x + 10, this.y + 4));
      this.game.ammo--;
  }
}

class Enemy {
  constructor(game) {
    this.game            = game;
    // this.x               = this.game.width;
    this.y               = 0;
    // this.speedX          = Math.random() * -1.5 - 0.5;
    this.speedY          = Math.random() * -1.5 - 0.5;
    this.markForDeletion = false;
    this.lives           = 5;
    this.score           = this.lives;
  }

  update() {
    this.y -= this.speedY;
    if(this.y > this.game.height) this.markForDeletion = true;
  }

  draw(context) {
    context.fillStyle = 'red';
    context.fillRect(this.x, this.y, this.width, this.height);
    if(window.debug) {
      context.font = '20px Arial';
      context.fillText(this.lives, this.x, this.y);
    }
  }
}

class Enemy1 extends Enemy {
  constructor(game) {
    super(game);

    this.width  = 30;
    this.height = 30;
    this.x      = Math.random() * (this.game.height * 0.9 - this.height);
  }
}

class Layer {
  constructor(game, image, speedModifier) {
    this.game = game;
    this.image = image;
    this.speedModifier = speedModifier;
    this.width = 600;
    this.height = 1200;
    this.x = 0;
    this.y = game.height - this.height;
  }

  update() {
    if(this.y >= this.game.height) this.y = this.game.height - this.height;
    else this.y += this.game.speed * this.speedModifier;
  }

  draw(context) {
    context.drawImage(this.image, this.x, this.y);
    context.drawImage(this.image, this.x, this.y - this.height);
  }

}

class Backgound {
  constructor(game) {
    this.game = game;

    this.image1 = document.querySelector('#layer1');
    this.layer1 = new Layer(this.game, this.image1, 0.5);

    this.image2 = document.querySelector('#layer2');
    this.layer2 = new Layer(this.game, this.image2, 0.2);

    this.layers = [
      this.layer1
    ];
  }

  update() {
    this.layers.forEach(layer => layer.update())
  }

  draw(context) {
    this.layers.forEach(layer => layer.draw(context));
  }
}

class UI {
  constructor(game) {
    this.game = game;
    this.fontSize = 20;
    this.fontFamily = 'FiveByFive';
    this.color = 'red';
  }

  draw(context) {
    //
    context.save();

    context.font = this.fontSize + 'px ' + this.fontFamily;

    // Ammo
    context.fillStyle = this.color;
    for(let i = 0; i < this.game.ammo; i++) {
      context.fillRect(10 +(5 * i), 10, 3, 20);
    }

    // Score
    context.fillText(`Score: ${this.game.score}`, this.game.width - 140, 30);

    // Game Over Screen
    if(this.game.gameOver) {
      context.textAlign = 'center';
      let messageLine1 = 'Game Over!';
      let messageLine2 = '';

      if(this.game.score >= this.game.winningScore) {
        messageLine2 += 'You win!!!';
      } else {
        messageLine2 += 'You Lose!';
      }

      context.fontSize = 50
      context.fillText(messageLine1, this.game.width / 2, this.game.height / 2 - 50);

      context.fontSize = 20
      context.fillText(messageLine2, this.game.width / 2, this.game.height / 2);
    }

    // Timer
    const formattedTime = (this.game.gameTime * 0.001).toFixed(1)
    context.textAlign = 'center';
    context.fillText(`Timer ${formattedTime}s`, this.game.width / 2, this.game.height - 20)

    //
    context.restore();
  }
}

class Game {
  constructor(width, height) {
    this.width    = width;
    this.height   = height;
    this.keys     = [];
    this.gameOver = false;
    this.gameTime = 0;

    this.score        = 0;
    this.winningScore = 1000;
    this.speed = 1;

    this.enemies       = [];
    this.enemyTimer    = 0;
    this.enemyInterval = 1000; // 1 sec

    this.ammo      = 20;
    this.maxAmmo   = 50;
    this.ammoTimer = 0;
    this.ammoInterval = 500; // 0.5 sec

    this.backgound = new Backgound(this);
    this.player = new Player(this);
    this.input  = new InputHandler(this);
    this.ui     = new UI(this);
  }

  update(deltaTime) {
    // Timer
    this.gameTime += deltaTime;

    // Player
    this.player.update();

    // Ammo
    if(this.ammoTimer > this.ammoInterval) {
      if(this.ammo < this.maxAmmo) this.ammo++;
      this.ammoTimer = 0;
    } else{
      this.ammoTimer += deltaTime;
    }

    // Enemies
    this.enemies.forEach(enemy => {
      enemy.update();

      if(this.checkCollission(this.player, enemy)) {
        enemy.markForDeletion = true;
      }

      this.player.projetiles.forEach(projetile => {
        if(this.checkCollission(projetile, enemy)) {
          enemy.lives--;
          projetile.markForDeletion = true;

          if(enemy.lives <= 0) {
            enemy.markForDeletion = true;
            if(!this.gameOver) this.score += enemy.score;
            if(this.score > this.winningScore) this.gameOver = true;
          }
        }
      })

      // Bg
      this.backgound.update();
      this.backgound.layer2.update();
    })

    this.enemies = this.enemies.filter(e => !e.markForDeletion);

    if(this.enemyTimer > this.enemyInterval && !this.gameOver) {
      this.addEnemy();
      this.enemyTimer = 0;
    } else {
      this.enemyTimer += deltaTime;
    }
  }

  draw(context) {
    // Bg [Back]
    this.backgound.draw(context);

    // Player
    this.player.draw(context);

    // UI
    this.ui.draw(context);

    // Enemies
    this.enemies.forEach(enemy => {
      enemy.draw(context);
    })

    // Bg [Front]
    this.backgound.layer2.draw(context);
  }

  addEnemy() {
    this.enemies.push(new Enemy1(this));
  }

  checkCollission(rect1, rect2) {
    return(
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.height + rect1.y > rect2.y
    )
  }
}
