abstract class State {
  data : GameData;
  UI : UIElement[];
	
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
  MINE,
  FUEL_FACTORY,
  CONSTRUCTION_PARTS_FACTORY
}

class PlayerData {
  selected_building : BuildingType = BuildingType.NONE;
  selected_direction : Facing = Facing.UP;

  construction_parts : number;
  fuel : number;

  jetpack : boolean;
  constructor(){
    function next(dir : Facing) {
      switch (dir) {
      case Facing.UP:    return Facing.RIGHT;
      case Facing.RIGHT: return Facing.DOWN;
      case Facing.DOWN:  return Facing.LEFT;
      case Facing.LEFT:  return Facing.UP;
      }
    }
    document.addEventListener("keydown", e => {
      if (e.keyCode == 82) this.selected_direction = next(this.selected_direction);
      if (e.keyCode == 81) this.selected_building = BuildingType.NONE;
      if (e.keyCode == 66) this.selected_building = BuildingType.BELT;
      if (e.keyCode == 77) this.selected_building = BuildingType.MINE;
      if (e.keyCode == 70) this.selected_building = BuildingType.FUEL_FACTORY
      if (e.keyCode == 67) this.selected_building = BuildingType.CONSTRUCTION_PARTS_FACTORY;
      if (e.keyCode == 74) {if (this.fuel > 0) this.jetpack = !this.jetpack;}
    });
    this.construction_parts = 10;
    this.fuel = 100;
    this.jetpack = false;
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
    this.asteroid = new Asteroid(new Map(30,30,25));
    this.cam = new Point(0,0);
    this.leftover_t = 0;

    this.init_UI();
  }

  public init_UI() {
    this.UI = [];
    let buttons_tileset = new Tileset('assets/test_button.png', 32);
    this.UI.push(new SelectionButton(buttons_tileset, new Point(10,44), new Point(0,0), BuildingType.MINE));
    this.UI.push(new SelectionButton(buttons_tileset, new Point(10,10), new Point(0,0), BuildingType.BELT));
    this.UI.push(new SelectionButton(buttons_tileset, new Point(10,78), new Point(0,0), BuildingType.FUEL_FACTORY));
    this.UI.push(new SelectionButton(buttons_tileset, new Point(10,112), new Point(0,0), BuildingType.CONSTRUCTION_PARTS_FACTORY));
    this.UI.push(new MineralCounter(0, 0, new Point(10, 590)));
    this.UI.push(new FuelInfo(0, 0, new Point(10, 570)));
  }

  public tick() : State {
    this.leftover_t += this.data.dt();
    
    while(this.leftover_t >= DT) {
      this.leftover_t -= DT;
      this.asteroid.tick(this.data, this.player_data, this.cam);

      let player_pos = this.asteroid.player.pos;
      this.cam.x = Math.floor(player_pos.x - this.data.width/2);
      this.cam.y = Math.floor(player_pos.y - this.data.height/2);
      for(let E of this.UI) E.tick(this.player_data);
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

class NavigationState extends State {
  click: boolean;
  map: SuperDuperAwesomeGalacticSpaceStarMap;

  constructor(data: GameData) {
    super(data);
    this.map = new SuperDuperAwesomeGalacticSpaceStarMap(25, 19);
  }

  public tick() {
    if(this.click) {}
    return this;
  }

  public render() {
    this.data.ctx.fillStyle = "black";
    this.data.ctx.clearRect(0,0,this.data.width, this.data.height);
  }
}

class EndState extends State {}
