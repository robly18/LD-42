class Prop {
  pos : Point;
  constructor(pos: Point) {
    this.pos = pos;
  }
  public render_background(data : GameData, ts : Tileset, x : number, y : number) {
    if (this.belt != null) this.belt.render(data, ts, x, y);
  }
  public render_foreground(data : GameData, ts : Tileset, x : number, y : number) {
    if (this.building != null) this.building.render(data,ts,x,y);
  }

  public belt_dir() : Facing | null {
    if (this.belt == null) return null;
    else return this.belt.facing;
  }

  belt : Belt | null = null;
  building : Building | null = null;
}

abstract class Building {
  constructor () {};

  public render(data : GameData, ts : Tileset, x : number, y : number) {
    let [tx, ty] = this.tile_pos(data);
    ts.draw(data, tx, ty, x, y);
  }

  protected abstract tile_pos(data : GameData) : [number, number];
}

class Mine extends Building {
  constructor() {
    super();
  }

  public render(data : GameData, ts : Tileset, x : number, y : number) {
    let [tx, ty] = this.tile_pos(data);
    ts.draw(data, tx, ty, x, y);
  }

  protected tile_pos(data : GameData) : [number, number] {
    return [0,1];
  }
}

class Belt {
  facing : Facing;
  constructor(facing : Facing) {
    this.facing = facing;
  }

  public render(data : GameData, ts : Tileset, x : number, y : number) {
    let [tx, ty] = this.tile_pos(data);
    ts.draw(data, tx, ty, x, y);
  }

  protected tile_pos(data : GameData) : [number, number] {
    let ty = this.facing;
    let tx = 4+Math.floor(data.curr_t() / 1000 * BELT_SPEED_PXPERSEC) % 4;
    return [tx,ty];
  }
}
