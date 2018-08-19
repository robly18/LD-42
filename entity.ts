class Entity {
  pos : Point;
  velocity : Point;
  floating : boolean;
  constructor(pos: Point, floating : boolean = false) {
    this.pos = pos;
    this.floating = floating;
  }

  public tick(data : GameData, asteroid : Asteroid) {
    if (this.movement != null) this.movement.tick(data, this);
    if (!this.floating) {
      let pos = this.pos;
      let newposx = new Point(pos.x + this.velocity.x*DT, pos.y);
      if (!asteroid.map.empty(newposx)) pos = newposx;

      let newposy = new Point(pos.x, pos.y + this.velocity.y*DT);
      if (!asteroid.map.empty(newposy)) pos = newposy;
      this.pos = pos;
    } else {
      this.pos.x += this.velocity.x*DT;
      this.pos.y += this.velocity.y*DT;
    }
    console.log(this.pos.x, this.pos.y);
  }

  movement : MovementComponent | null = null;
  graphics : GraphicsComponent | null = null;
}
