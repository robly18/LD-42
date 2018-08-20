const DT = 1000/60;
const BELT_SPEED_PXPERSEC = 32;
const BUILDING_RANGE = 100;
const GROUND_MAX_VALUE = 16;

const CONSTRUCTION_PARTS_RECIPE : [number, number, number] = [1, 0, 1/16];
const CONSTRUCTION_PARTS_TIME = 100;
const FUEL_RECIPE : [number, number, number] = [0,25,0];
const FUEL_TIME = 1000;


window.onload = function() {
  itemtileset = new Tileset("assets/items.png", 8, 8);
  let game : Game = new Game(document.getElementById('canvas') as HTMLCanvasElement);
  game.start();
}
