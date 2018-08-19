class GameData {
  width : number;
  height : number;

  canvas : HTMLCanvasElement;
  ctx : CanvasRenderingContext2D;
  
  prev_t : number;
  new_t : number;
  
  constructor(canvas : HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    this.width = canvas.width;
    this.height = canvas.height;
	
	
    this.prev_t = Date.now();
    this.new_t = Date.now();
  }
  
  tick() {
	this.prev_t = this.new_t;
	this.new_t = Date.now();
  }
  
  dt() : number {
	return this.new_t - this.prev_t;
  }
  curr_t() : number {
    return this.new_t;
  }
}

class Game {
  data : GameData;
  state : State;
  constructor(canvas : HTMLCanvasElement) {
    this.data = new GameData(canvas);
    this.state = new MenuState(this.data);
  }


  public start() {
    this.data.tick(); this.data.tick();
    this.loop();
  }

  private loop() {
    this.data.tick();
    this.state = this.state.tick();
    this.state.render();
    requestAnimationFrame(this.loop.bind(this));
  }
}
