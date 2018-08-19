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

abstract class MovementComponent {
  constructor(){}
  public abstract tick(data : GameData, entity : Entity) : void;
}

class PlayerMovementComponent {
  constructor(){}
  public tick(data : GameData, entity : Entity) {
      entity.velocity = new Point(0,0);
      if (68 in data.keys) entity.velocity.x += 1;
      if (65 in data.keys) entity.velocity.x -= 1;
      if (83 in data.keys) entity.velocity.y += 1;
      if (87 in data.keys) entity.velocity.y -= 1;
      if (entity.velocity.x != 0 || entity.velocity.y != 0) {
        let sf = 0.5 / ( (v => Math.sqrt(v.x*v.x + v.y*v.y))(entity.velocity));
        entity.velocity.x *= sf;
        entity.velocity.y *= sf;
      }
  }
}

abstract class GraphicsComponent {
  constructor(){}
  public abstract render(data : GameData, entity : Entity) : void;
}

