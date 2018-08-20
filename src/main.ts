const DT = 1000/60;
const BELT_SPEED_PXPERSEC = 32;
const BUILDING_RANGE = 100;

window.onload = function() {
  itemtileset = new Tileset("assets/items.png", 8, 8);
  let game : Game = new Game(document.getElementById('canvas') as HTMLCanvasElement);
  game.start();
}
