window.onload = function() {
  //let game : Game = new Game(document.getElementById('canvas') as HTMLCanvasElement);
  //game.start();

  let map : Map = new Map(100,100);
  for(let i = 0; i < 100; i++)
    for(let j = 0; j < 100; j++)
      console.log(map.ground[i][j]);
}
