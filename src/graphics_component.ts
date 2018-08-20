abstract class GraphicsComponent {
  constructor(){}
  public abstract render(data: GameData, entity: Entity): void;
}

enum Facing {
  DOWN = 0,
  RIGHT = 1,
  LEFT = 2,
  UP = 3
}

class CreatureGraphicsComponent {
  tileset : Tileset;
  facing : Facing = Facing.DOWN;
  timeInThisState : number = 0;
  timePerFrame : number;

  constructor(src : string, timePerFrame : number = 100) {
    this.tileset = new Tileset(src, 8, 16);
    this.timePerFrame = timePerFrame;
  }

  public render(data: GameData, entity: Entity) {
    if (entity.velocity.x == 0 && entity.velocity.y == 0) {
      this.timeInThisState = 0;
    } else {
      let oldFacing = this.facing;
      let newFacing = this.facingDirection(entity);
      if (oldFacing == newFacing) {
        this.timeInThisState += data.dt();
      } else {
        this.timeInThisState = 0;
        this.facing = newFacing;
      }
    }
    let tx = Math.floor(this.timeInThisState/this.timePerFrame) % 4;
    let tileset = this.tileset;
    tileset.draw(data, tx, this.facing, data.width/2 - tileset.tile_width/2, data.height/2 - tileset.tile_height);
  }

  private facingDirection(entity : Entity) : Facing {
    let v = entity.velocity;
    if (v.y > 0) return Facing.DOWN;
    if (v.y < 0) return Facing.UP;
    if (v.x < 0) return Facing.LEFT;
    if (v.x > 0) return Facing.RIGHT;
    return Facing.DOWN;
  }
}
