const tile_size = 32;

enum Resource {
  MATTER  = 0,
  ICE     = 1,
  URANIUM = 2
}

class Tile {
  type : Resource;
  quantity : number;
  constructor(type : Resource, qt : number) {
    this.type = type;
    this.quantity = qt;
  }
  public render(data : GameData, ts : Tileset, x : number, y : number) {
    let [tx, ty] = this.tilePos();
    data.ctx.globalAlpha = this.quantity/GROUND_MAX_VALUE;
    ts.draw(data, tx, ty, x, y);
    data.ctx.globalAlpha = 1;
  }

  private tilePos() : [number, number] {
    switch (this.type) {
      case Resource.MATTER: return [1,0];
      case Resource.ICE:    return [2,0];
      case Resource.URANIUM:return [3,0];
      default: return[0,0];
    }
  }
}

class Map {
  width : number;
  height : number;
  max_gen : number;

  ground:  (Tile | null)[][];
  surface: { [id : number] : { [id:number]:Prop } };

  spawn : Point;
  tileset : Tileset;

  constructor(width : number, height : number, max_gen: number) {
    this.tileset = new Tileset("assets/tile.png", tile_size);

    this.width = width;
    this.height = height;
    this.max_gen = max_gen;

    this.ground = [];
    this.surface = {};
    this.init();
  }

  private init() {
    for(let i = 0; i < this.width; i++) {
      this.ground[i]  = [];
      for(let j = 0; j < this.height; j++) {
        this.ground[i][j]  = null;
      }
    }

    this.spawn = this.generate([100,0,30]);
  }

  public tick(asteroid : Asteroid, player_data : PlayerData) {
    let surface = this.surface;
    for (let i in surface) {
      for (let j in surface[i]) {
        let b = surface[i][j].building;
        if (b != null) b.tick(surface[i][j].pos, asteroid, player_data)
      }
    }
  }

  public render_background(data : GameData, cam : Point) {
    let img = new Image();
    img.src = 'assets/menu_background.png';
    data.ctx.drawImage(img, -cam.x/10, -cam.y/10);

    let nwx = Math.max(Math.floor(cam.x/tile_size), 0);
    let nwy = Math.max(Math.floor(cam.y/tile_size), 0);
    let sex = Math.min(Math.ceil((cam.x + data.width)/tile_size), this.width-1);
    let sey = Math.min(Math.ceil((cam.y + data.height)/tile_size), this.height-1);
    for(let i = nwx; i <= sex; i++) {
      for(let j = nwy; j <= sey; j++) {
        let g = this.ground[i][j]
        if (g != null) {
          g.render(data, this.tileset, i*tile_size - cam.x, j*tile_size - cam.y);
        }
      }
    }
    for (let i in this.surface) {
      let col = this.surface[i];
      for (let j in col) {
        let p : Prop = col[j];
        p.render_background(data, this.tileset, p.pos.x*tile_size - cam.x, p.pos.y*tile_size - cam.y);
      }
    }
  }

  public render_foreground(data : GameData, cam : Point) {
    for (let i in this.surface) {
      let col = this.surface[i];
      for (let j in col) {
        let p : Prop = col[j];
        p.render_foreground(data, this.tileset, p.pos.x*tile_size - cam.x, p.pos.y*tile_size - cam.y);
      }
    }
  }

  public render_ghost(data : GameData, pos : Point, player_data : PlayerData, cam : Point) {
    let coordinates = new Point(Math.floor(pos.x/tile_size), Math.floor(pos.y/tile_size));
    if (this.emptyTile(coordinates)) return false;
    switch (player_data.selected_building) {
      case BuildingType.BELT: {
        let g = new Belt(player_data.selected_direction);
        g.render(data, this.tileset, coordinates.x*tile_size - cam.x, coordinates.y*tile_size - cam.y, true);
        break;
      }
      case BuildingType.MINE: {
        let g = new Mine();
        g.render(data, this.tileset, coordinates.x*tile_size - cam.x, coordinates.y*tile_size - cam.y, true);
        break;
      }
      case BuildingType.CONSTRUCTION_PARTS_FACTORY: {
        let g = make_construction_parts_factory();
        g.render(data, this.tileset, coordinates.x*tile_size - cam.x, coordinates.y*tile_size - cam.y, true);
        break;
      }
      case BuildingType.FUEL_FACTORY: {
        let g = make_fuel_factory();
        g.render(data, this.tileset, coordinates.x*tile_size - cam.x, coordinates.y*tile_size - cam.y, true);
        break;
      }
      default: break;
    }
  }

  public build(data : GameData, pos : Point, player_data : PlayerData) : boolean {
    let coordinates = new Point(Math.floor(pos.x/tile_size), Math.floor(pos.y/tile_size));
    if (coordinates.x < 0 || coordinates.x >= this.width) return false;
    if (coordinates.y < 0 || coordinates.y >= this.height) return false;
    switch (player_data.selected_building) {
      case BuildingType.BELT:
        return this.add_belt(new Point(coordinates.x, coordinates.y), player_data.selected_direction);
      case BuildingType.MINE:
        return this.add_building(new Point(coordinates.x, coordinates.y), new Mine());
      case BuildingType.CONSTRUCTION_PARTS_FACTORY:
        return this.add_building(new Point(coordinates.x, coordinates.y), make_construction_parts_factory());
      case BuildingType.FUEL_FACTORY:
        return this.add_building(new Point(coordinates.x, coordinates.y), make_fuel_factory());
      default: return false;
    }
  }

  public generate(req: [number, number, number]) : Point {
    let queue: [Point, number][] = [];
    let seed: Point = new Point(rand_int(this.width), rand_int(this.height));

    for(let k = 0; k < 3; k++) {
      for(let i = 0; i < req[k]; i++) {
        while(this.ground[seed.x][seed.y])
          seed = new Point(rand_int(this.width), rand_int(this.height));
        this.ground[seed.x][seed.y] = new Tile(k, GROUND_MAX_VALUE);

        let to_fill: number[][] = [];
        for(let j = 0; j < 8; j++)
          to_fill.push([rand_int(3)-1, rand_int(3)-1]);

        for(let idx of to_fill) {
          let new_pos = seed;
          new_pos.x += idx[0];
          new_pos.y += idx[1];

          if(i < req[k] && new_pos.is_valid(this.width, this.height) && !this.ground[new_pos.x][new_pos.y]) {
            this.ground[new_pos.x][new_pos.y] = new Tile(k, GROUND_MAX_VALUE);
            queue.push([new_pos, 0]);
            i++;
          }
        }
        queue.push([seed,0]);
        seed = new Point(rand_int(this.width), rand_int(this.height));
      }
    }

    while(queue.length > 0) {
      let [cur_pos, cur_gen] = queue[0];
      queue.shift();

      let to_fill: number[] = [];
      for(let j = 0; j < 4; j++)
        to_fill.push(rand_int(4));

      for(let idx of to_fill) {
        let new_pos = cur_pos;
        if(idx == 0) new_pos.x += 1;
        if(idx == 1) new_pos.x -= 1;
        if(idx == 2) new_pos.y += 1;
        if(idx == 3) new_pos.y -= 1;

        if(cur_gen < this.max_gen && new_pos.is_valid(this.width, this.height) && !this.ground[new_pos.x][new_pos.y]) {
          this.ground[new_pos.x][new_pos.y] = new Tile(Resource.ICE, GROUND_MAX_VALUE);
          queue.push([new_pos, cur_gen+1]);
        }
      }
    }

    let ret = seed;
    while(!this.ground[ret.x][ret.y])
      ret = new Point(rand_int(this.width), rand_int(this.height));
    return ret;
  }

  public empty(p : Point) {
    let i = Math.floor(p.x/tile_size);
    let j = Math.floor(p.y/tile_size);
    if (i < 0 || i >= this.width) return true;
    if (j < 0 || j >= this.width) return true;
    return (this.ground[i][j] == null);
  }

  public emptyTile(p :Point ) {
    let i = p.x;
    let j = p.y;
    if (i < 0 || i >= this.width) return true;
    if (j < 0 || j >= this.width) return true;
    return (this.ground[i][j] == null);
  }

  public add_belt(pos : Point, dir : Facing) : boolean {
    if (this.emptyTile(pos)) return false;
    let i = pos.x;
    let j = pos.y;
    if (i in this.surface) {
      if (j in this.surface[i]) {
        let p = this.surface[i][j]
        if (p.belt == null) {
          p.belt = new Belt(dir);
          return true;
        } else return false;
      } else {
        this.surface[i][j] = new Prop(pos);
        this.surface[i][j].belt = new Belt(dir);
        return true;
      }
    } else {
      this.surface[i] = {};
      this.surface[i][j] = new Prop(pos);
      this.surface[i][j].belt = new Belt(dir);
      return true;
    }
  }
  public destroy_belt(pos : Point) : boolean {
    if (this.emptyTile(pos)) return false;
    let i = pos.x;
    let j = pos.y;
    if (i in this.surface) {
      if (j in this.surface[i]) {
        let p = this.surface[i][j]
        if (p.belt != null) {
          p.belt = null;
          if (p.building == null) delete this.surface[i][j];
          return true;
        }
      }
    }
    return false;
  }

  public add_building(pos : Point, b : Building) : boolean {
    if (this.emptyTile(pos)) return false;
    let i = pos.x;
    let j = pos.y;
    if (i in this.surface) {
      if (j in this.surface[i]) {
        let p = this.surface[i][j]
        if (p.building == null) {
          p.building = b;
          return true;
        } else return false;
      } else {
        this.surface[i][j] = new Prop(pos);
        this.surface[i][j].building = b;
        return true;
      }
    } else {
      this.surface[i] = {};
      this.surface[i][j] = new Prop(pos);
      this.surface[i][j].building = b;
      return true;
    }
  }

  public get_prop(p : Point) : Prop | null {
    if (p.x in this.surface)
      if (p.y in this.surface[p.x])
        return this.surface[p.x][p.y];
    return null;
  }

  public make_crater(p : Point, asteroid : Asteroid) {
    let coords = new Point(Math.floor(p.x/tile_size), Math.floor(p.y/tile_size));
    for (let dx = -2; dx <= 2; dx++)
    for (let dy = -2; dy <= 2; dy++) {
      let cc = coords.plus(new Point(dx, dy));
      if (!this.emptyTile(cc)) {
        let tile = this.ground[cc.x][cc.y] as Tile;
        tile.quantity -= Math.floor((9 - dx*dx - dy*dy)*(-Math.log(Math.random())));
        if (tile.quantity <= 0) asteroid.deleteTileAt(cc);
      }
    }
  }

  public pick_target() : Point {
    let likelihoods : [number, Point][] = [];
    let total = 0;
    for (let i = 0; i != this.width; i++) {
      for (let j = 0; j != this.height; j++) {
        if (this.ground[i][j] == null) continue;
        else {
          let likelihood = 1;
          if (i in this.surface && j in this.surface[i]) likelihood *= 2;
          total += likelihood;
          likelihoods.push([total, new Point(i+Math.random(),j+Math.random()).times(tile_size)]);
        }
      }
    }
    likelihoods.push([total*0.01+1, new Point(Math.random() * this.width, Math.random() * this.height)]);
    let p = Math.random() * total;
    let i = 0;
    while (likelihoods[i][0] <= p) i++;
    return likelihoods[i][1];
  }
}
