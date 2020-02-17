<template>
  <div class="h-100 bg-black">
    <template v-if="$socket.id === $root.game.player1.id">
      <canvas id="player1"></canvas>
    </template>

    <template v-else>
      <canvas id="player2"></canvas>
    </template>
  </div>
</template>

<script>
export default {
  data() {
    return {
      canvas: null,
      context: null,
      paddle: { x: null, y: null, width: 20, height: 100, dx: 0, dy: 0 },
      paddleSpeed: 2,
      grid: 15,
      ball: { x: null, y: null, width: 20, height: 20, resetting: false, dx: 0, dy: 0, color: '#fff'},
      ballSpeed: 1,
    };
  },
  sockets: {
    ball_data(data) {
      data.x = (data.x === 1) ? this.canvas.width : 0;
      this.ball = data;
    },
    new_ball() {
      this.ball = { x: null, y: null, width: 20, height: 20, resetting: false, dx: 0, dy: 0, color: '#fff'};
      this.ball.x = (this.$socket.id === this.$root.game.player1.id) ? this.canvas.width : 0;
      this.ball.y = this.canvas.height / 2;
      this.ball.dx =  (this.$socket.id === this.$root.game.player1.id) ? -this.ballSpeed : this.ballSpeed;
      this.ball.dy = -this.ballSpeed;
    }
  },
  mounted() {
    let id = this.$socket.id === this.$root.game.player1.id ? "1" : "2";
    this.canvas = document.getElementById(`player${id}`);
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    this.context = this.canvas.getContext("2d");

    this.paddle.x = this.canvas.width / 2;
    this.paddle.y = this.canvas.height / 2;

    this.ball.x = this.canvas.width;
    this.ball.y = this.canvas.height / 2;
    
    if (this.$socket.id === this.$root.game.player1.id) {
      this.ball.dx = -this.ballSpeed;
      this.ball.dy = -this.ballSpeed;
    }

    document.addEventListener("keydown", e => {
      // a key
      if (e.which === 65) this.paddle.dx = -this.paddleSpeed;
      // d key
      else if (e.which === 68) this.paddle.dx = this.paddleSpeed;

      // w key
      if (e.which === 87) this.paddle.dy = -this.paddleSpeed;
      // s key
      else if (e.which === 83) this.paddle.dy = this.paddleSpeed;
    });

    document.addEventListener("keyup", e => {
      if (e.which === 65 || e.which === 68) this.paddle.dx = 0;
      if (e.which === 87 || e.which === 83) this.paddle.dy = 0;
    });

    this.drawContent();
    setInterval(() => this.drawContent(), 5);
  },
  methods: {
    drawContent: function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // move paddles by their velocity
      this.paddle.x += this.paddle.dx;
      this.paddle.y += this.paddle.dy;
      
      // move ball by its velocity
      this.ball.x += this.ball.dx;
      this.ball.y += this.ball.dy;

      // prevent paddles from going through walls
      let maxPaddleX = this.canvas.width - this.grid - this.paddle.width;
      if (this.paddle.x < this.grid) this.paddle.x = this.grid;
      else if (this.paddle.x > maxPaddleX) this.paddle.x = maxPaddleX;

      let maxPaddleY = this.canvas.height - this.grid - this.paddle.height;
      if (this.paddle.y < this.grid) this.paddle.y = this.grid;
      else if (this.paddle.y > maxPaddleY) this.paddle.y = maxPaddleY;

      // prevent ball from going through walls by changing its velocity
      if (this.ball.y < this.grid) {
        this.ball.y = this.grid;
        this.ball.dy *= -1;
      } else if (this.ball.y + this.grid > this.canvas.height - this.grid) {
        this.ball.y = this.canvas.height - this.grid * 2;
        this.ball.dy *= -1;
      }

      // reset ball if it goes past paddle (but only if we haven't already done so)
      // if ((this.ball.x < 0 || this.ball.x > this.canvas.width) && !this.ball.resetting) {
      //   this.ball.resetting = true;

      //   // give some time for the player to recover before launching the ball again
      //   setTimeout(() => {
      //     this.ball.resetting = false;
      //     this.ball.x = this.canvas.width;
      //     this.ball.y = this.canvas.height / 2;
      //   }, 400);
      // }

      if (this.ball.x < 0) {
        if (this.$socket.id === this.$root.game.player1.id) {
          console.log('point to player2', this.ball);
          this.$socket.emit('new_ball', {player: this.$root.game.player2.id});
        } else {
          this.ball.x = 1;
          this.$socket.emit('ball_data', {player: this.$root.game.player1.id, ball: this.ball});
        }

        this.ball = { x: 0, y: 0, width: 0, height: 0, resetting: true, dx: 0, dy: 0, color: '#fff'};
      } else if (this.ball.x > this.canvas.width) {
        if (this.$socket.id === this.$root.game.player1.id) {
          this.ball.x = 0;
          this.$socket.emit('ball_data', {player: this.$root.game.player2.id, ball: this.ball});
        } else {
          console.log('point to player1', this.ball);
          this.$socket.emit('new_ball', {player: this.$root.game.player1.id});
        }

        this.ball = { x: 0, y: 0, width: 0, height: 0, resetting: true, dx: 0, dy: 0, color: '#fff'};
      }

      // if ((this.ball.x < 0 || this.ball.x > this.canvas.width) && !this.ball.resetting) {
      //   if (this.$socket.id === this.$root.game.player1.id) {
      //     // give some time for the player to recover before launching the ball again
      //     setTimeout(() => {
      //       this.ball.resetting = false;
      //       this.ball.x = this.canvas.width;
      //       this.ball.y = this.canvas.height / 2;
      //     }, 400);
      //   } else {
      //     console.log('send ball data', this.ball);
      //     this.ball = { x: null, y: null, width: 20, height: 20, resetting: false, dx: 0, dy: 0, color: '#fff'};
      //   }
      // }

      // check to see if ball collides with paddle. if they do change x velocity
      if (this.collides(this.ball, this.paddle)) {
        // check if the player has not touched the ball
        if (this.ball.color !== (this.$socket.id === this.$root.game.player1.id) ? "#ff7043" : "#29b6f6") {
          this.ball.dx *= -1.05;
          // move ball next to the paddle otherwise the collision will happen again in the next frame
          if (this.ball.x < this.paddle.x) {
            this.ball.x = this.paddle.x - this.paddle.width;
          } else {          
            this.ball.x = this.paddle.x + this.paddle.width;
          }
          this.ball.color = (this.$socket.id === this.$root.game.player1.id) ? "#ff7043" : "#29b6f6";
        }
      }

      // draw ball
      this.context.fillStyle = this.ball.color;
      this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);

      // draw walls
      // this.context.fillStyle = 'lightgrey';
      // this.context.fillRect(0, 0, this.canvas.width, this.grid);
      // this.context.fillRect(0, this.canvas.height - this.grid, this.canvas.width, this.canvas.height);

      // // draw dotted line down the middle
      // for (let i = this.grid; i < this.canvas.height - this.grid; i += this.grid * 2) {
      //   this.context.fillRect(this.canvas.width / 2 - this.grid / 2, i, this.grid, this.grid);
      // }

      this.context.fillStyle = (this.$socket.id === this.$root.game.player1.id) ? "#ff7043" : "#29b6f6";
      this.context.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    },
    collides: function(obj1, obj2) {
      return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
    },
    drawBall: function() {

    }
  }
};
</script>

<style>
.bg-black {
  background-color: black;
}
</style>