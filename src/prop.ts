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

  public abstract tick(coords : Point, asteroid : Asteroid, player_data : PlayerData) : void;

  public render(data : GameData, ts : Tileset, x : number, y : number, ghost : boolean = false) {
    let [tx, ty] = this.tile_pos(data);
    if (ghost) data.ctx.globalAlpha = 0.5;
    ts.draw(data, tx, ty, x, y);
    data.ctx.globalAlpha = 1;
  }

  protected abstract tile_pos(data : GameData) : [number, number];

  public give(t : Resource) {return false;}
}

class Mine extends Building {
  ticks_since_mined : number = 0;
  ticks_between_mine : number = TICKS_PER_MINE;

  constructor() {
    super();
  }

  public tick(coords : Point, asteroid : Asteroid, player_data : PlayerData) {
    this.ticks_since_mined++;
    if (this.ticks_since_mined >= this.ticks_between_mine) {
      this.ticks_since_mined = 0;
      this.mine(coords, asteroid);
    }
  }

  public mine(coords : Point, asteroid : Asteroid) {
    let likelihood : [number, Point][] = [];
    let total : number = 0;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        let nc = coords.plus(new Point(dx,dy));
        if (!asteroid.map.emptyTile(nc)) {
          let this_likelihood = 3 - Math.sqrt(dx*dx + dy*dy);
          if (asteroid.map.get_prop(nc) != null) this_likelihood /= 5;
          total += this_likelihood;
          likelihood.push([total, nc]);
        }
      }
    }
    let n = Math.random() * total;
    let i = 0;
    while (n >= likelihood[i][0]) i++;
    let nc = likelihood[i][1];
    let g = asteroid.map.ground[nc.x][nc.y] as Tile;
    g.quantity--;
    asteroid.entities.push(make_item(coords, g.type));
    if (g.quantity == 0) asteroid.deleteTileAt(nc);
  }

  protected tile_pos(data : GameData) : [number, number] {
    return [0,2];
  }
}

enum FactoryType {
  FUEL,
  CONSTRUCTION_PARTS
}

class Factory extends Building {
  recipe : [number, number, number];
  have : [number, number, number] = [0,0,0];
  ticks_to_build : number;
  ticks_til_build : number = -1;
  type : FactoryType;
  constructor(recipe : [number,number,number], ticks_to_build : number, type : FactoryType) {
    super();
    this.recipe = recipe;
    this.ticks_to_build = ticks_to_build;
    this.type = type;
  }

  public tick(coords : Point, asteroid : Asteroid, player_data : PlayerData) {
    if (this.ticks_til_build == 0) {
      switch(this.type) {
      case FactoryType.FUEL:  player_data.fuel++; break;
      case FactoryType.CONSTRUCTION_PARTS: player_data.construction_parts++; break;
      }
    }
    if (this.ticks_til_build >= 0) {
      this.ticks_til_build--;
    }
    if (this.ticks_til_build == -1) {
      let can = true;
      for (let i in this.have) if (this.have[i] < this.recipe[i]) can = false;
      if (can) {
        this.ticks_til_build = this.ticks_to_build;
        for (let i in this.have) this.have[i] -= this.recipe[i];
      }
    }
  }

  public render(data : GameData, ts : Tileset, x : number, y : number, ghost : boolean = false) {
    super.render(data, ts, x, y, ghost);
    if (this.ticks_til_build != -1) {
      let ctx = data.ctx;
      let barp = new Point(x + 2, y + tile_size - 6);
      let w = tile_size - 4;
      let h = 4;
      ctx.fillStyle = "black";
      ctx.fillRect(barp.x, barp.y, w, h);
      ctx.fillStyle = "green";
      ctx.fillRect(barp.x, barp.y, Math.floor(w * this.ticks_til_build / this.ticks_to_build), h);
    }
  }

  public give(t : Resource) {
    if (this.have[t] < this.recipe[t]) {
      this.have[t]++; return true;
    } else return false;
  }

  protected tile_pos(data : GameData) : [number, number] {
    if (this.ticks_til_build == -1)
      switch (this.type) {
      case FactoryType.FUEL:  return [0,4];
      case FactoryType.CONSTRUCTION_PARTS: return [1,4];
      }
    else
      switch (this.type) {
      case FactoryType.FUEL:  return [0,5];
      case FactoryType.CONSTRUCTION_PARTS: return [1,5];
      }
    return [0,0];
  }
}

function make_construction_parts_factory() {
  return new Factory(CONSTRUCTION_PARTS_RECIPE, CONSTRUCTION_PARTS_TIME, FactoryType.CONSTRUCTION_PARTS);
}

function make_fuel_factory() {
  return new Factory(FUEL_RECIPE, FUEL_TIME, FactoryType.FUEL);
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
