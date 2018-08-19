abstract class MovementComponent {
  constructor(){}
  public abstract tick(data: GameData, entity: Entity): void;
}

class PlayerMovementComponent {
  constructor(){}
  public tick(data: GameData, entity: Entity) {
      entity.velocity = new Point(0,0);
      if (68 in data.keys) entity.velocity.x += 1;
      if (65 in data.keys) entity.velocity.x -= 1;
      if (83 in data.keys) entity.velocity.y += 1;
      if (87 in data.keys) entity.velocity.y -= 1;
      if (entity.velocity.x != 0 || entity.velocity.y != 0) {
        let sf = 0.2 / ( (v => Math.sqrt(v.x*v.x + v.y*v.y))(entity.velocity));
        entity.velocity.x *= sf;
        entity.velocity.y *= sf;
      }
  }
}
