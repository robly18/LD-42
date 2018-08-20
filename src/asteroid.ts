class Asteroid {
  map : Map;
  entities : Entity[];
  player : Entity;

  constructor(map : Map) {
    this.map = map;
    this.entities = [];
    this.player = new Entity(new Point(100,100), false);
    this.player.movement = new PlayerMovementComponent();
    this.player.graphics = new CreatureGraphicsComponent("assets/player.png");
  }

  public tick(data : GameData) {
    for (let e of this.entities) {
      e.tick(data, this);
    }
    player.tick(data, this);
  }

  public render(data : GameData, cam : Point) {
    this.map.render_background(data, cam);
    for (let e of this.entities) {
      e.render(data, cam);
    }
    player.render(data,cam);
    this.map.render_foreground(data, cam);
  }
}
