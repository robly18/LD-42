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

  public tick(data : GameData, player_data : PlayerData, cam : Point) {
    for (let e of this.entities) {
      e.tick(data, this);
    }
    this.player.tick(data, this);

    if (data.mouse[0] && player_data.building_materials > 0) {
      let mpos_in_space = data.mpos.plus(cam);
      let delta = mpos_in_space.minus(this.player.pos);
      if (delta.dot(delta) <= BUILDING_RANGE * BUILDING_RANGE) {
        if(this.map.build(data, mpos_in_space, player_data)) player_data.building_materials--;
      }
    }
  }

  public render(data : GameData, player_data : PlayerData, cam : Point) {
    let mpos_in_space = data.mpos.plus(cam);
    let delta = mpos_in_space.minus(this.player.pos);

    this.map.render_background(data, cam);
    if (delta.dot(delta) <= BUILDING_RANGE * BUILDING_RANGE) {
      this.map.render_ghost(data, mpos_in_space, player_data, cam);
    }
    for (let e of this.entities) {
      e.render(data, cam);
    }
    this.player.render(data,cam);
    this.map.render_foreground(data, cam);
  }
}
