abstract class State {
  data : GameData;
	
  constructor(data : GameData) {
    this.data = data;
  }

  public tick() : State {return this;}
  public render() {}
}

class MenuState extends State {
  x: number;

  constructor(data : GameData) {
    super(data);
    this.x = 0;
  }

  public tick() : State {
    this.x += this.data.dt()/20;
    this.x %= 800;
    return this;
  }
  
  public render() {
    let background = new Image();
    background.src = 'assets/menu_background.png';

    let ctx = this.data.ctx;
    ctx.drawImage(background, this.x, 0); 
    ctx.drawImage(background, this.x-background.width, 0); 
  }
}

class PlayState extends State {
  asteroid : Asteroid;
  cam : Point;

  leftover_t : number;
  UI : UIElement[];

  constructor(data : GameData) {
    super(data);
    this.asteroid = new Asteroid(new Map(100,100,25));
    this.cam = new Point(0,0);
    this.leftover_t = 0;
    this.UI = [];
  }

  public tick() : State {
    this.leftover_t += this.data.dt();
    
    while(this.leftover_t >= DT) {
      this.leftover_t -= DT;
      this.asteroid.tick(this.data);

      let player_pos = this.asteroid.player.pos;
      this.cam.x = player_pos.x - this.data.width/2;
      this.cam.y = player_pos.y - this.data.height/2;
      for(let E of this.UI) E.tick();
    }
    return this;
  }
  
  public render() {
    this.data.ctx.fillStyle = "black";
    this.data.ctx.clearRect(0,0,this.data.width, this.data.height);
    this.asteroid.render(this.data, this.cam);

    for(let E of this.UI) {
      E.render(this.data);
    }
  }
}
