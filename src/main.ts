const DT = 1000/60;

window.onload = function() {
  let game : Game = new Game(document.getElementById('canvas') as HTMLCanvasElement);
  game.start();
}
