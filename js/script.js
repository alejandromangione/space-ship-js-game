window.addEventListener('load', () => {

  /*
   * Canvas Setup
   */
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
      if(game.debug) console.dir(game)

      switch(e.key) {
        case 'ArrowUp':
          if(this.game.keys.indexOf(e.key) === -1) this.game.keys.push(e.key);
          break;
        case 'ArrowDown':
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

    this.width  = 10;
    this.height = 3;
    this.speed  = 3;
    this.markForDeletion = false;
  }

  update() {
    this.x += this.speed;

    if(this.x > this.game.width * 0.8)
      this.markForDeletion = true;
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

    this.width  = 26;
    this.height = 21;
    this.x      = 10;
    this.y      = 40;

    this.speedY   = 0;
    this.maxSpeed = 4;
    this.projetiles = [];
  }

  update() {
    if(this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
    else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
    else this.speedY = 0;

    this.y += this.speedY;

    // handle projetiles
    this.projetiles.forEach(p => {
      p.update();
    });

    this.projetiles = this.projetiles.filter(projetile => !projetile.markForDeletion)
  }

  draw(context) {
    context.fillStyle = 'black';
    context.fillRect(this.x, this.y, this.width, this.height);

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
    this.x               = this.game.width;
    this.speedX          = Math.random() * -1.5 - 0.5;
    this.markForDeletion = false;
  }

  update() {
    this.x += this.speedX;
    if(this.x + this.game.width < 0) this.markForDeletion = true;
  }

  draw(context) {
    context.fillStyle = 'red';
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Enemy1 extends Enemy {
  constructor(game) {
    super(game);

    this.width  = 30;
    this.height = 30;
    this.y      = Math.random() * (this.game.height * 0.9 - this.height);
  }
}

class Layer {
  constructor() {
  }
}

class Backgound {
  constructor() {
  }
}

class UI {
  constructor(game) {
    this.game = game;
    this.fontSize = 25;
    this.fontFamily = 'Helvetica';
    this.color = 'yellow';
  }

  draw(context) {
    // Ammo
    context.fillStyle = this.color;
    for(let i = 0; i < this.game.ammo; i++) {
      context.fillRect(10 +(5 * i), 10, 3, 20);
    }
  }
}

class Game {
  constructor(width, height) {
    this.width    = width;
    this.height   = height;
    this.keys     = [];
    this.gameOver = false;

    this.enemies       = [];
    this.enemyTimer    = 0;
    this.enemyInterval = 1000; // 1 sec

    this.ammo      = 20;
    this.maxAmmo   = 50;
    this.ammoTimer = 0;
    this.ammoInterval = 500; // 0.5 sec

    this.player = new Player(this);
    this.input  = new InputHandler(this);
    this.ui     = new UI(this);

    this.debug = true;
  }

  update(deltaTime) {
    // PLayer
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
    this.player.draw(context);

    this.ui.draw(context);

    this.enemies.forEach(enemy => {
      enemy.draw(context);
    })
  }

  addEnemy() {
    this.enemies.push(new Enemy1(this));
  }
}