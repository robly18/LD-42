const DT = 1000/60;
const BELT_SPEED_PXPERSEC = 32

window.onload = function() {
  let game : Game = new Game(document.getElementById('canvas') as HTMLCanvasElement);
  game.start();
}
