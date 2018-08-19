class Asteroid {
  map : Map;
  entities : Entity[];
  player : Entity;

  constructor(map : Map) {
    this.map = map;
    this.entities = [];
    this.player = new Entity(new Point(100,100), false);
    this.player.movement = new PlayerMovementComponent();
    this.player.graphics = new CreatureGraphicsComponent("player.png");
    this.entities.push(this.player);
  }

  public tick(data : GameData) {
    for (let e of this.entities) {
      e.tick(data, this);
    }
  }

  public render(data : GameData, cam : Point) {
    let ctx = data.ctx;
    this.map.render(data, cam);

    for (let e of this.entities) {
      e.render(data, cam);
    }
  }
}
