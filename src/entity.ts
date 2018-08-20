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

      let belt_velocity = new Point(0,0);
      let coordinate = new Point(Math.floor(pos.x/tile_size), Math.floor(pos.y/tile_size));
      let prop_here = asteroid.map.get_prop(coordinate);
      if (prop_here != null) {
        let d = prop_here.belt_dir();
        if (d != null) {
          let et = dir_to_vector(d); //yay orthonormal bases
          let en = new Point(et.y, -et.x); //counterclockwise 90deg
          let center = new Point((coordinate.x+1/2)*tile_size, (coordinate.y+1/2)*tile_size);
          let delta = en.times(pos.minus(center).dot(en)); //vector from the belt's center axis to the object
          let deltanorm = Math.sqrt(delta.dot(delta));

          if (deltanorm < tile_size / 4)
            belt_velocity = belt_velocity.plus(et.times(BELT_SPEED_PXPERSEC/1000));
          else
            belt_velocity = belt_velocity.plus(delta.times(-BELT_SPEED_PXPERSEC/1000/deltanorm));
        }
      }

      this.velocity = this.velocity.plus(belt_velocity);


      let newposx = new Point(pos.x + this.velocity.x*DT, pos.y);
      if (!asteroid.map.empty(newposx)) pos = newposx;

      let newposy = new Point(pos.x, pos.y + this.velocity.y*DT);
      if (!asteroid.map.empty(newposy)) pos = newposy;

      this.pos = pos;

      this.velocity = this.velocity.minus(belt_velocity);
    } else {
      this.pos = this.pos.plus(this.velocity);
    }
  }

  public render(data: GameData, cam: Point) {
    if (this.graphics != null) this.graphics.render(data, this);
  }

  movement : MovementComponent | null = null;
  graphics : GraphicsComponent | null = null;
}
