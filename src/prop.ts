abstract class Prop {
  pos : Point;
  constructor(pos: Point) {
    this.pos = pos;
  }
  public render(data : GameData, ts : Tileset, x : number, y : number) {
    let [tx, ty] = this.tile_pos(data);
    ts.draw(data, tx, ty, x, y);
  }

  public belt_dir() : Facing | null {return null;}

  protected abstract tile_pos(data : GameData) : [number, number];
}

class Mine extends Prop {
  constructor(pos: Point) {
    super(pos);
  }

  protected tile_pos(data : GameData) : [number, number] {
    return [0,1];
  }
}

class Belt extends Prop {
  facing : Facing;
  constructor(pos : Point, facing : Facing) {
    super(pos);
    this.facing = facing;
  }

  public belt_dir() : Facing | null {return this.facing;}

  protected tile_pos(data : GameData) : [number, number] {
    let ty = this.facing;
    let tx = 4+Math.floor(data.curr_t() / 1000 * BELT_SPEED_PXPERSEC) % 4;
    return [tx,ty];
  }
}
