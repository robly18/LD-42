abstract class State {
  click: boolean;
  data : GameData;
  UI : UIElement[];
	
  constructor(data : GameData) {
    this.data = data;
    this.UI = [];
    this.click = false;
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
  map: Map;
  player_data : PlayerData;
  asteroid : Asteroid;
  cam : Point;

  leftover_t : number;
  UI : UIElement[];

  constructor(data : GameData) {
    super(data);
    this.player_data = new PlayerData();
    this.map = new Map(30, 30, 25);
    this.asteroid = new Asteroid(this.map);
    this.cam = new Point(0,0);
    this.leftover_t = 0;

    this.init_UI();
  }

  public set_map(map : Map) {
    this.map = map;
    this.asteroid = new Asteroid(map);
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
  UI: UIElement[];
  map: SuperDuperAwesomeGalacticSpaceStarMap;

  constructor(data: GameData) {
    super(data);
    this.UI = [];
    this.map = new SuperDuperAwesomeGalacticSpaceStarMap(17, 12);
  }

  public tick() : State {
    if(this.click) {
      this.click = false;
      let p = new Point(Math.floor(this.data.mpos.x / 47), Math.floor(this.data.mpos.y / 50));
      console.log(p.x);
      if(!this.map.is_empty(p)) {
        let new_state = new PlayState(this.data);
        new_state.set_map(this.map.matrix[p.x][p.y] as Map);
        return new_state;
      }
    }
    return this;
  }

  public render() {
    let img = new Image();
    img.src = 'assets/menu_background.png';
    this.data.ctx.drawImage(img, 0, 0);

    let width = Math.floor(800 / this.map.width)
    let height = Math.floor(600 / this.map.height)
    this.data.ctx.fillStyle = "white";
    for(let i = 0; i < this.map.width; i++)
      this.data.ctx.fillRect(i*width, 0, 1, 600);
    this.data.ctx.fillRect(799,0, 1, 600)

    for(let i = 0; i < this.map.height; i++)
      this.data.ctx.fillRect(0, i*height, 800, 1);
    this.data.ctx.fillRect(0, 599, 800, 1)

    let ast = new Image();
    ast.src = 'assets/asteroid.png';
    for(let i = 0; i < this.map.width; i++)
      for(let j = 0; j < this.map.height; j++)
        if(!this.map.is_empty(new Point(i,j)))
          this.data.ctx.drawImage(ast, i*width, j*height);

  }
}

class EndState extends State {}
