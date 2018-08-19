class GameData {
  width : number;
  height : number;

  canvas : HTMLCanvasElement;
  ctx : CanvasRenderingContext2D;
  
  prev_t : number;
  new_t : number;

  keys : { [id:number]: boolean };
  
  constructor(canvas : HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    this.width = canvas.width;
    this.height = canvas.height;
	
    this.prev_t = Date.now();
    this.new_t = Date.now();

    this.keys = {};
    document.addEventListener("keydown", e => {this.keys[e.keyCode] = true;});
    document.addEventListener("keyup", e => {delete this.keys[e.keyCode];});
  }
  
  public tick() {
    this.prev_t = this.new_t;
    this.new_t = Date.now();
  }
  
  public dt() : number {
    return this.new_t - this.prev_t;
  }

  public curr_t() : number {
    return this.new_t;
  }
}

class Game {
  data : GameData;
  state : State;
  constructor(canvas : HTMLCanvasElement) {
    this.data = new GameData(canvas);
    this.state = new PlayState(this.data);
  }

  public start() {
    this.loop();
  }

  private loop() {
    this.data.tick();
    this.state = this.state.tick();
    this.state.render();

    requestAnimationFrame(this.loop.bind(this));
  }
}
