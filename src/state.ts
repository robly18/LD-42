abstract class State {
  click: boolean;
  data : GameData;
  UI : UIElement[];
	
  constructor(data : GameData) {
    this.data = data;
    this.UI = [];
    this.click = false;
  }

  public set_map(map : Map) {}
  public set_player_data(player_data : PlayerData) {}
  public tick() : State {return this;}
  public render() {}
}

class MenuState extends State {
  clicked : boolean;

  constructor(data : GameData) {
    super(data);
    this.clicked = false;
    data.canvas.addEventListener("mousedown", e => {this.clicked = true;});
    data.canvas.addEventListener("keydown", e => {this.clicked = true;});
  }

  public tick() : State {
    if (this.clicked) {
      let nav = new NavigationState(this.data);
      nav.set_player_data(new PlayerData());
      return nav;
    } 
    else return this;
  }
  
  public render() {
    let background = new Image();
    background.src = 'assets/menu_background.png';

    let ctx = this.data.ctx;
    ctx.drawImage(background, 0, 0);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "30px Arial";
    ctx.fillText("Welcome to LD-42 \"Running out of Space\"",this.data.width/2,50);
    ctx.font = "17px Arial";
    let text = ["Your goal is to return home by hopping from asteroid to asteroid.",
                "To do this, you need fuel, which you get by electrolyzing Ice using Fuel Factories.",
                "Factories also need power,",
                "so you also need to provide them with small amounts of Uranium.",
                "All of these resources can be mined from the surface of said asteroids, using Mines.",
                "And carried from these mines to the factories using Conveyor Belts.",
                "All of these buildings require Construction Materials. Fortunately you",
                "can also make a Construction Material Factory, which turns stone into CM.",
                "Those are all the available buildings: Belts, Mines, and Fuel and CM Factories.",
                "These can be built with the menu, or using the hotkeys B, M, F, C.",
                "Belts can be rotated using R.",
                "As you mine, you expend the asteroid you are on, so be careful!",
                "The more you mine, the less space you have available.",
                "Furthermore, there are asteroids which collide against yours and wear out its edges.",
                "If you are stuck, you can press J to use a Jetpack. But beware, as that uses the",
                "precious fuel you need to return home!",
                "That should be all. On an asteroid, your goal is to collect as much fuel as possible!",
                "Once you conclude you can't collect any more, click the Launch button to move on.",
                "Good luck, and don't run out of space!"];
    for (let i = 0; i != text.length; i++)
      ctx.fillText(text[i],this.data.width/2,100 + 17*i);
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
  navigation_state : NavigationState;

  map: Map;
  player_data : PlayerData;
  asteroid : Asteroid;
  cam : Point;

  leftover_t : number;
  UI : UIElement[];

  constructor(data : GameData, ns : NavigationState) {
    super(data);
    this.player_data = new PlayerData();
    this.map = new Map(30, 30, 25);
    this.asteroid = new Asteroid(this.map);
    this.cam = new Point(0,0);
    this.leftover_t = 0;
    this.navigation_state = ns;

    this.init_UI();
  }

  public set_player_data(player_data: PlayerData) {
    this.player_data = player_data;
  }

  public set_map(map : Map) {
    this.map = map;
    this.asteroid = new Asteroid(map);
  }

  public init_UI() {
    this.UI = [];
    let buttons_tileset = new Tileset('assets/button.png', 32);
    this.UI.push(new SelectionButton(buttons_tileset, new Point(10,44), new Point(0,1), BuildingType.MINE));
    this.UI.push(new SelectionButton(buttons_tileset, new Point(10,10), new Point(0,0), BuildingType.BELT));
    this.UI.push(new SelectionButton(buttons_tileset, new Point(10,78), new Point(0,2), BuildingType.FUEL_FACTORY));
    this.UI.push(new SelectionButton(buttons_tileset, new Point(10,112), new Point(0,3), BuildingType.CONSTRUCTION_PARTS_FACTORY));
    this.UI.push(new LauchButton(buttons_tileset, new Point(10,146), new Point(2, 1)));
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
      for(let E of this.UI) {
        if(E instanceof LauchButton && E.pressed) {
          let p = this.navigation_state.map.cur_pos;
          this.navigation_state.map.matrix[p.x][p.y] = null;
          this.player_data.construction_parts = 10;
          this.player_data.jetpack = false;
          
          this.navigation_state.set_player_data(this.player_data);
          return this.navigation_state;
        }
        E.tick(this.player_data);
      }
    }
    return this;
  }
  
  public render() {
    this.data.ctx.fillStyle = "black";
    this.data.ctx.clearRect(0,0,this.data.width, this.data.height);
    this.asteroid.render(this.data, this.player_data, this.cam);
    for(let E of this.UI) E.render(this.data);
  }
}

class NavigationState extends State {
  click: boolean;
  player_data : PlayerData;
  UI: UIElement[];
  map: SuperDuperAwesomeGalacticSpaceStarMap;

  constructor(data: GameData) {
    super(data);
    this.UI = [];
    this.map = new SuperDuperAwesomeGalacticSpaceStarMap(17, 12);
  }

  public set_player_data(player_data: PlayerData) {
    this.player_data = player_data;
  }

  public tick() : State {
    if(this.click) {
      this.click = false;
      let p = new Point(Math.floor(this.data.mpos.x / 47), Math.floor(this.data.mpos.y / 50));

      //ez bug fix
      //much wow
      p.x = Math.min(p.x, 16);
      p.y = Math.min(p.y, 11);

      let cost = COST_PER_UNIT * this.map.dist(this.map.cur_pos, p);
      if(cost <= this.player_data.fuel) {
        if(p.x == 16 && p.y == 11) return new EndState(this.data);
        if(!this.map.is_empty(p)) {
          this.player_data.fuel -= COST_PER_UNIT * this.map.dist(this.map.cur_pos, p);
          let new_state = new PlayState(this.data, this);
          new_state.set_map(this.map.matrix[p.x][p.y] as Map);
          new_state.set_player_data(this.player_data);

          this.map.cur_pos = p;
          return new_state;
        }
      }
    }
    return this;
  }

  public render() {
    let img = new Image();
    img.src = 'assets/menu_background.png';
    this.data.ctx.drawImage(img, 0, 0);

    let width = Math.floor(800 / this.map.width);
    let height = Math.floor(600 / this.map.height);
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
        if(!this.map.is_empty(new Point(i,j)) && !(i == 16 && j == 11))
          this.data.ctx.drawImage(ast, i*width, j*height);

    let plr = new Image();
    plr.src = 'assets/player.png';
    this.data.ctx.drawImage(plr, 0, 0, 8, 16, this.map.cur_pos.x*width + 16, this.map.cur_pos.y*height + 10, 16, 32);

    this.data.ctx.fillStyle = 'white';
    let p = new Point(Math.floor(this.data.mpos.x / 47), Math.floor(this.data.mpos.y / 50));
    let cost = this.map.dist(this.map.cur_pos, p) * COST_PER_UNIT;
    if(cost > this.player_data.fuel) this.data.ctx.fillStyle = 'red';
    this.data.ctx.font = "13px Arial";
    this.data.ctx.textAlign = "right";
    this.data.ctx.fillText("Fuel: " + cost, this.data.mpos.x, this.data.mpos.y);
  }
}

const COST_PER_UNIT = 0;
class EndState extends State {
  clicked : boolean;

  constructor(data : GameData) {
    super(data);
    this.clicked = false;
    data.canvas.addEventListener("mousedown", e => {this.clicked = true;});
    data.canvas.addEventListener("keydown", e => {this.clicked = true;});
  }

  public tick() : State {
    if (this.clicked) {
      return new MenuState(this.data);
    } 
    else return this;
  }
  
  public render() {
    let background = new Image();
    background.src = 'assets/menu_background.png';

    let ctx = this.data.ctx;
    ctx.drawImage(background, 0, 0);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "30px Arial";
    ctx.fillText("Congratulations! You have won.",this.data.width/2,50);
    ctx.font = "17px Arial";
    let text = ["You have returned home to your friends and family.",
                "Rejoice! (And click the screen to go back to the menu)"];
    for (let i = 0; i != text.length; i++)
      ctx.fillText(text[i],this.data.width/2,100 + 17*i);
  }
}


class GameOverState extends State {
  clicked : boolean;

  constructor(data : GameData) {
    super(data);
    this.clicked = false;
    data.canvas.addEventListener("mousedown", e => {this.clicked = true;});
    data.canvas.addEventListener("keydown", e => {this.clicked = true;});
  }

  public tick() : State {
    if (this.clicked) {
      return new MenuState(this.data);
    } 
    else return this;
  }
  
  public render() {
    let background = new Image();
    background.src = 'assets/menu_background.png';

    let ctx = this.data.ctx;
    ctx.drawImage(background, 0, 0);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "30px Arial";
    ctx.fillText("Alas! You have perished.",this.data.width/2,50);
    ctx.font = "17px Arial";
    let text = ["Your friends and family will miss you. :(",
                "Click the screen to go back to the menu)"];
    for (let i = 0; i != text.length; i++)
      ctx.fillText(text[i],this.data.width/2,100 + 17*i);
  }
}

