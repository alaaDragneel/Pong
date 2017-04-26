var mainWidth = 700, mainHeight = 600, pi = Math.PI;
var upArrow = 38, downArrow = 40;
var canvas, ctx, keyState;
var player, ai, ball;

player  = {
  x: null, // left position
  y: null, // top position
  width: 20,
  height: 100,

  update: function () {
    if (keyState[upArrow]) this.y -= 7; // if true the player top position will decrease by -7
    if (keyState[downArrow]) this.y += 7; // if true the player top position will increase by +7
    this.y = Math.max(Math.min(this.y, mainHeight - this.height), 0);
  },
  draw: function () {
    // draw a rectangle ctx.fillRect(left, top, width, height)
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },
};

ai  = {
  x: null, // left position
  y: null, // top position
  width: 20,
  height: 100,

  update: function () {
    var desty = ball.y - (this.height - ball.side) * 0.5;
    this.y += (desty - this.y) * 0.1;
    this.y = Math.max(Math.min(this.y, mainHeight - this.height), 0);
  },
  draw: function () {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },
};

ball  = {
  x: null, // left position
  y: null, // top position
  vel: null, // velocity
  side: 20, // make it a square
  speed: 12,

  serve: function (side) {
    var r = Math.random();
    this.x = side === 1 ? player.x + player.width : ai.x - this.side;
    this.y = (mainHeight - this.side) * r;

    var phi = 0.1 * pi * (1 - 2 * r);

    this.vel = {
      x: side * this.speed * Math.cos(phi),
      y: this.speed * Math.sin(phi)
    };
  },
  update: function () {
    this.x += this.vel.x;
    this.y += this.vel.y; // increase the top posision by the speed value

    if (0 > this.y || this.y + this.side > mainHeight) {
        // the true condition if the top position be nigative make it positive by {-} math sign
        // the false condition if the top position be positive and get out from the canvas height
        var offset = this.vel.y < 0 ? 0 - this.y : mainHeight - (this.y + this.side);
        this.y += 2 * offset;
        this.vel.y *= -1;
    }

    // access align bulbbing boxs {AABB}
    var AABBIntersect = function (ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ay < by + bh && bx < ax + aw && by < ay + ah;
    };


    var pdle = this.vel.x < 0 ? player : ai;

    if (AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height, this.x, this.y, this.side, this.side)) {
      this.x = pdle === player ? player.x + player.width : ai.x - this.side;
      var n = (this.y + this.side - pdle.y) / (pdle.height + this.side);
      var phi = 0.25 * pi * (2 * n - 1);

      // The Math.abs() function returns the absolute of a value.
      var smash = Math.abs(phi) > 0.2 * pi ? 1.5 : 1;
      // The Math.cos() function returns the cosine of a number.
      // 1 for moveing right, -1 for moving left
      this.vel.x = smash * (pdle === player ? 1 : -1) * this.speed * Math.cos(phi);
      this.vel.y = smash * this.speed * Math.sin(phi); // The Math.sin() function returns the sine of a number.
    }

    if (0 > this.x + this.side || this.x > mainWidth) {
        this.serve(pdle === player ? 1 : -1);
    }

  },
  draw: function () {
    ctx.fillRect(this.x, this.y, this.side, this.side);
  },
};


function main() {
  canvas = document.createElement('canvas');
  canvas.width = mainWidth;
  canvas.height = mainHeight;
  ctx = canvas.getContext("2d");
  document.body.appendChild(canvas);

  keyState = [];

  document.addEventListener('keydown', function (e) {
    keyState[e.keyCode] = true; // to move the player if the arrow key pressed
  });
  document.addEventListener('keyup', function (e) {
    delete keyState[e.keyCode]; // to stop moving the player if the arrow key not pressed
  });

  init();

  var loop = function () {
    update();
    draw();

    window.requestAnimationFrame(loop, canvas);
  };

  window.requestAnimationFrame(loop, canvas);
}

function init() {
  player.x = player.width; // make the left position of the player Ex: if width 100 the left == 100

  /*
    the player top position == the main canvas height - the player top position / 2
    EX: if mainHeight == 500, player.height == 100 then to get the player in the middle of the canvas
    --  500 - 100 = 400, 400 / 2 = 200
    **  the top position will be 200px
    **  {NOTE: 200px before the player rectangle}
    **  the palyer height will be 100px
    **  the rest of the canvas will be 200px {NOTE: 200px after the player rectangle}
    **  the total 500px
  */
  player.y = (mainHeight - player.height) / 2;

  /*
    to make the ai in the right position
    the ai left position == the main canvas width - (the player width position + ai.width)
    EX: if mainWidth == 100, player.width == 20 then to get the ai in the right position of the canvas
    -- the left postioin will be = 100
    {NOTE the ai will not appear because it is start point == the main width so it will تعدي من حدود الشاشه}
    -- remove the player.width == 20
    {NOTE will make the left == 80 and the ai will appear but it ه
    اتكون لازقه في الجانب الايمن لانها اتحركت بمقدار عرضها بس اللي هو 20 بكسل و ظهرت بس}
    -- remove the شه.width == 20
    {NOTE will make the left == 60 and the ai will be the same player.x width looks like}
  */
  ai.x = mainWidth - (player.width + ai.width);
  ai.y = (mainHeight - ai.height) / 2;

  ball.serve(1);
}

function update() {
  player.update();
  ai.update();
  ball.update()
}

function draw() {
  ctx.fillRect(0, 0, mainWidth, mainHeight);

  // save defualt ctx.fillRect setting like it will take the fillStyle and save it,it will take the default color that is black
  ctx.save();

  ctx.fillStyle = "#FFF";
  player.draw();
  ai.draw();
  ball.draw();

  // darw the half field line |
  var w = 4;
  var x = (mainWidth - w) * 0.5; // NOTE * 0.5 == 1/2 EX: 10 - 4 = 6, 6 * 1/2 = 3, 6 / 2 = 3 the same
  var y = 0;
  var step = mainHeight / 20;

  while(y < mainHeight) {
    ctx.fillRect(x, y + step * 0.25, w, step * 0.5);
    y += step;
  }

  // restore defualt fillRect setting like it will take the fillStyle and save it,it will take the default color that is black
  ctx.restore();

}

main();
