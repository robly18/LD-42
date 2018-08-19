let canvas : HTMLCanvasElement;
let ctx : CanvasRenderingContext2D;

window.onload = function() {
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  let game : Game = new Game(canvas);
  game.start();
}
