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

enum BuildingType {
  NONE,
  BELT,
  MINE
}

class PlayerData {
  selected_building : BuildingType = BuildingType.MINE;
  selected_direction : Facing = Facing.UP;
=======

  building_materials : number;
  constructor(){
    function next(dir : Facing) {
      switch (dir) {
      case Facing.UP:    return Facing.RIGHT;
      case Facing.RIGHT: return Facing.DOWN;
      case Facing.DOWN:  return Facing.LEFT;
      case Facing.LEFT:  return Facing.UP;
      }
    }
    document.addEventListener("keydown", e => {if (e.keyCode == 82) this.selected_direction = next(this.selected_direction);});
    this.building_materials = 10;
  }
}

class PlayState extends State {
  player_data : PlayerData;
  asteroid : Asteroid;
  cam : Point;

  leftover_t : number;
  UI : UIElement[];

  constructor(data : GameData) {
    super(data);
    this.player_data = new PlayerData();
    this.asteroid = new Asteroid(new Map(100,100,25));
    this.cam = new Point(0,0);
    this.leftover_t = 0;
    this.UI = [];
    let button_tileset = new Tileset('asset/test_button.ts', 32);
    let test_button = new Button(button_tileset);
  }

  public tick() : State {
    this.leftover_t += this.data.dt();
    
    while(this.leftover_t >= DT) {
      this.leftover_t -= DT;
      this.asteroid.tick(this.data, this.player_data, this.cam);

      let player_pos = this.asteroid.player.pos;
      this.cam.x = Math.floor(player_pos.x - this.data.width/2);
      this.cam.y = Math.floor(player_pos.y - this.data.height/2);
      for(let E of this.UI) E.tick();
    }
    return this;
  }
  
  public render() {
    this.data.ctx.fillStyle = "black";
    this.data.ctx.clearRect(0,0,this.data.width, this.data.height);
    this.asteroid.render(this.data, this.player_data, this.cam);
    for(let E of this.UI)  E.render(this.data);
  }
}
