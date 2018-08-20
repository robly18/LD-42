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

  public abstract tick(coords : Point, asteroid : Asteroid) : void;

  public render(data : GameData, ts : Tileset, x : number, y : number, ghost : boolean = false) {
    let [tx, ty] = this.tile_pos(data);
    if (ghost) data.ctx.globalAlpha = 0.5;
    ts.draw(data, tx, ty, x, y);
    data.ctx.globalAlpha = 1;
  }

  protected abstract tile_pos(data : GameData) : [number, number];
}

class Mine extends Building {
  ticks_since_mined : number = 0;
  ticks_between_mine : number = 10;

  constructor() {
    super();
  }

  public tick(coords : Point, asteroid : Asteroid) {
    this.ticks_since_mined++;
    if (this.ticks_since_mined >= this.ticks_between_mine) {
      this.ticks_since_mined = 0;
      asteroid.entities.push(make_item(coords, Resource.ICE));
    }
  }

  protected tile_pos(data : GameData) : [number, number] {
    return [0,2];
  }
}

class Belt {
  facing : Facing;
  constructor(facing : Facing) {
    this.facing = facing;
  }

  public render(data : GameData, ts : Tileset, x : number, y : number, ghost : boolean = false) {
    let [tx, ty] = this.tile_pos(data);
    if (ghost) data.ctx.globalAlpha = 0.5;
    ts.draw(data, tx, ty, x, y);
    data.ctx.globalAlpha = 1;
  }

  protected tile_pos(data : GameData) : [number, number] {
    let ty = this.facing;
    let tx = 4+Math.floor(data.curr_t() / 1000 * BELT_SPEED_PXPERSEC) % 4;
    return [tx,ty];
  }
}
