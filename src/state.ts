abstract class State {
  data : GameData;
	
  constructor(data : GameData) {
    this.data = data;
  }

  public tick() : State {return this;}
  public render() {}
}

class MenuState extends State {
  carry_t : number;
  secno : number;
  constructor(data : GameData) {
    super(data);
    this.carry_t = 0;
    this.secno = 0;
  }

  public tick() : State {
    this.carry_t += this.data.dt();
    while(this.carry_t > 1000) {
      this.carry_t -= 1000;
      this.secno += 1;
    }
    return this;
  }
  
  public render() {
    let ctx = this.data.ctx;

    ctx.fillStyle = "white";
    ctx.fillRect(0,0,this.data.width, this.data.height);
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("It has been "+String(this.secno)+(this.secno==1?" second.":" seconds."),10,50); 
  }
}

class PlayState extends State {
  asteroid : Asteroid;
  cam : Point;

  leftover_t : number;

  constructor(data : GameData) {
    super(data);
    this.asteroid = new Asteroid(new Map(100,100,10));
    this.cam = new Point(0,0);
    this.leftover_t = 0;
  }

  public tick() : State {
    this.leftover_t += this.data.dt();
    
    while(this.leftover_t >= DT) {
      this.leftover_t -= DT;
      this.asteroid.tick(this.data);

      let player_pos = this.asteroid.player.pos;
      this.cam.x = player_pos.x - this.data.width/2;
      this.cam.y = player_pos.y - this.data.height/2;
    }
    return this;
  }
  
  public render() {
    this.data.ctx.fillStyle = "black";
    this.data.ctx.clearRect(0,0,this.data.width, this.data.height);
    this.asteroid.render(this.data, this.cam);
  }
}
