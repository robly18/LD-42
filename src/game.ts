class GameData {
  width : number;
  height : number;

  canvas : HTMLCanvasElement;
  ctx : CanvasRenderingContext2D;
  
  prev_t : number;
  new_t : number;

  keys : { [id:number]: boolean };
  mpos : Point;

  mouse : [boolean, boolean, boolean]; //left, middle, right
  
  constructor(canvas : HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    this.width = canvas.width;
    this.height = canvas.height;
	
    this.prev_t = Date.now();
    this.new_t = Date.now();

    this.keys = {};
    this.mouse = [false,false,false];
    document.addEventListener("keydown", e => {this.keys[e.keyCode] = true;});
    document.addEventListener("keyup", e => {delete this.keys[e.keyCode];});
    document.addEventListener("mousedown", e => {this.mouse[e.button] = true;});
    document.addEventListener("mouseup", e => {this.mouse[e.button] = false;});
    
    this.mpos = new Point(0,0);
    this.canvas.addEventListener("mousemove", e => {
      let mpos=this.mpos;
      mpos.x = e.clientX - this.canvas.offsetLeft;
      mpos.y = e.clientY - this.canvas.offsetTop;
    });
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
    this.data.canvas.addEventListener("click", e => {
      for(let E of this.state.UI)
        if(this.data.mpos.x >= E.screen_pos.x && this.data.mpos.x <= E.screen_pos.x+E.width)
          if(this.data.mpos.y >= E.screen_pos.y && this.data.mpos.y <= E.screen_pos.y+E.height)
            E.on_click(this.data)
    });
    this.loop();
  }

  private loop() {
    this.data.tick();
    this.state = this.state.tick();
    this.state.render();

    requestAnimationFrame(this.loop.bind(this));
  }
}
