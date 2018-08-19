class Entity {
  pos : Point;
  velocity : Point;
  floating : boolean;

  constructor(pos: Point, floating : boolean = false) {
    this.pos = pos;
    this.velocity = new Point(0,0);
    this.floating = floating;
  }

  public tick(data : GameData, asteroid : Asteroid) {
    if (this.movement != null) this.movement.tick(data, this);
    if (!this.floating) {
      let pos = this.pos;

      let belt_velocity : Point = new Point(0,0);

      let prop_here = asteroid.map.get_prop(new Point(Math.floor(pos.x/tile_size), Math.floor(pos.y/tile_size)));
      if (prop_here != null) {
        let d = prop_here.belt_dir();
        if (d != null) {
          switch (d) {
          case Facing.UP: belt_velocity.y -= BELT_SPEED_PXPERSEC / 1000; break;
          case Facing.DOWN: belt_velocity.y += BELT_SPEED_PXPERSEC / 1000; break;
          case Facing.RIGHT: belt_velocity.x += BELT_SPEED_PXPERSEC / 1000; break;
          case Facing.LEFT: belt_velocity.x -= BELT_SPEED_PXPERSEC / 1000; break;
          }
        }
      }

      this.velocity.x += belt_velocity.x;
      this.velocity.y += belt_velocity.y;

      console.log(this.velocity.x, this.velocity.y, belt_velocity.x, belt_velocity.y);

      let newposx = new Point(pos.x + this.velocity.x*DT, pos.y);
      if (!asteroid.map.empty(newposx)) pos = newposx;

      let newposy = new Point(pos.x, pos.y + this.velocity.y*DT);
      if (!asteroid.map.empty(newposy)) pos = newposy;

      this.pos = pos;

      this.velocity.x -= belt_velocity.x;
      this.velocity.y -= belt_velocity.y;
    } else {
      this.pos.x += this.velocity.x*DT;
      this.pos.y += this.velocity.y*DT;
    }
  }

  public render(data: GameData, cam: Point) {
    if (this.graphics != null) this.graphics.render(data, this);
  }

  movement : MovementComponent | null = null;
  graphics : GraphicsComponent | null = null;
}
