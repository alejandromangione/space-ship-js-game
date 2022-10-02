window.addEventListener('load', () => {

  /*
   * Canvas Setup
   */
  const canvas = document.querySelector("#canvas1");
  const ctx = canvas.getContext('2d');
  canvas.width = 500;
  canvas.height = 500;

  const game = new Game(canvas.width, canvas.height);

  function animate() {
    // Clear sreeen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.update();
    game.draw(ctx);

    requestAnimationFrame(animate);
  }

  // Start game
  animate();
});

/*
 * Classes
 */

class InputHandler {
  constructor(game) {
    this.game = game;

    window.addEventListener('keydown', (e) => {
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
    console.log(game, x, y)
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
    this.x      = 20;
    this.y      = 100;

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
    this.projetiles.push(new Projectile(this.game, this.x, this.y));

    console.log('shootTop')
  }
}

class Enemy {
  constructor() {
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
    this.color = 'white';
  }

  draw(context) {
    // Ammo
  }
}

class Game {
  constructor(width, height) {
    this.width  = width;
    this.height = height;
    this.keys = [];

    this.player = new Player(this);
    this.input  = new InputHandler(this);
    this.ui     = new UI(this);
  }

  update() {
    this.player.update();
  }

  draw(context) {
    this.player.draw(context);
  }
}