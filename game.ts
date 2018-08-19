let dt : number = 1000/ 60;

class Game {
  width : number;
  height : number;

  canvas : HTMLCanvasElement;
  ctx : CanvasRenderingContext2D;

  prev_t : number;

  constructor(canvas : HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    this.width = canvas.width;
    this.height = canvas.height;
  }

  public start() {
    this.prev_t = Date.now();
    this.loop();
  }

  private loop() {
    console.log("Im alive")
    let cur_t : number = Date.now();
    let delta : number = cur_t - this.prev_t;
    while(delta > dt) {
      delta -= dt;
      this.tick();
    }

    this.render();
    this.prev_t = Date.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  private tick() {}
  private render() {}
}
