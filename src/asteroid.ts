class Asteroid {
  map : Map;
  entities : Entity[];
  player : Entity;
  asteroids : [Point, Point][]; //pos, velocity
  lifetime : number = 0;

  constructor(map : Map) {
    this.map = map;
    this.entities = [];
    this.asteroids = [];
    this.player = new Entity(new Point(100,100), false);
    this.player.movement = new PlayerMovementComponent();
    this.player.graphics = new CreatureGraphicsComponent("assets/player.png");
  }

  public tick(data : GameData, player_data : PlayerData, cam : Point) {
    this.lifetime++;
    let center = new Point(this.map.width, this.map.height).times(tile_size/2);
    let field_r = Math.sqrt(this.map.width*this.map.width + this.map.height*this.map.height)*tile_size/2
                + Math.sqrt(data.width*data.width + data.height*data.height)/2;
    if (this.lifetime%ASTEROID_INTERVAL == 0) {
      let theta = 2 * Math.random() * Math.PI;
      let p = center.plus(new Point(Math.sin(theta), Math.cos(theta)).times(field_r))
      let tgt = this.map.pick_target();
      let delta = tgt.minus(p);
      let v = delta.times(ASTEROID_VELOCITY/Math.sqrt(delta.dot(delta)));
      this.asteroids.push([p, v]);
    }
    for (let i = 0; i < this.asteroids.length;) {
      let a = this.asteroids[i];
      a[0] = a[0].plus(a[1].times(DT));
      let rvec = a[0].minus(center);
      let r = Math.sqrt(rvec.dot(rvec));
      if (!this.map.empty(a[0]) || r > field_r) {
        if (!this.map.empty(a[0]))
          this.map.make_crater(a[0], this);
        this.asteroids[i] = this.asteroids[this.asteroids.length-1];
        this.asteroids.length--;
      } else i++;
    }

    if (player_data.fuel <= 0) player_data.jetpack = false;
    this.player.floating = player_data.jetpack;
    if (player_data.jetpack) {
      player_data.fuel--;
    }

    this.map.tick(this, player_data);
    for (let i = 0; i < this.entities.length;) {
      let e = this.entities[i];
      let stay = e.tick(data, this);
      if (stay) i++;
      else {
        this.entities[i] = this.entities[this.entities.length-1];
        this.entities.length--;
      }
    }
    this.player.tick(data, this);

    if (data.mouse[0] && player_data.construction_parts > 0) {
      let mpos_in_space = data.mpos.plus(cam);
      let delta = mpos_in_space.minus(this.player.pos);
      if (delta.dot(delta) <= BUILDING_RANGE * BUILDING_RANGE) {
        if(this.map.build(data, mpos_in_space, player_data)) player_data.construction_parts--;
      }
    } if (data.mouse[2]) {
      let mpos_in_space = data.mpos.plus(cam);
      let delta = mpos_in_space.minus(this.player.pos);
      if (delta.dot(delta) <= BUILDING_RANGE * BUILDING_RANGE) {
        if (this.map.destroy_belt(
              new Point(Math.floor(mpos_in_space.x/tile_size), Math.floor(mpos_in_space.y/tile_size))
            )) player_data.construction_parts++;
      }
    }
  }

  public render(data : GameData, player_data : PlayerData, cam : Point) {
    let mpos_in_space = data.mpos.plus(cam);
    let delta = mpos_in_space.minus(this.player.pos);

    this.map.render_background(data, cam);
    if (delta.dot(delta) <= BUILDING_RANGE * BUILDING_RANGE)
      this.map.render_ghost(data, mpos_in_space, player_data, cam);

    for (let e of this.entities)
      e.render(data, player_data, cam);

    this.player.render(data,player_data,cam);
    this.map.render_foreground(data, cam);

    for (let a of this.asteroids) {
      let p = a[0];
      itemtileset.draw(data, 3, 0, Math.floor(p.x) - 4 - cam.x, Math.floor(p.y) - 4 - cam.y);
    }
  }

  public deleteTileAt(pos : Point) {
    this.map.ground[pos.x][pos.y] = null;
    if (pos.x in this.map.surface) delete this.map.surface[pos.x][pos.y];
  }
}
