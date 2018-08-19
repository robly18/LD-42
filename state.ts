abstract class State {
  data : GameData;
	
  constructor(data : GameData) {
    this.data = data;
  }

  public tick() : State {return this;}
  render() {}
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
  constructor(data : GameData) {
    super(data);
    this.asteroid = new Asteroid(new Map(10,10));
  }

  public tick() : State {
    this.asteroid.tick();
    return this;
  }
  
  public render() {
    this.asteroid.render(this.data);
  }
}
