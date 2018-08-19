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
    ts.draw(data, tx, ty, x, y);
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

  tileset : Tileset;

  constructor(width : number, height : number, max_gen: number) {
    this.tileset = new Tileset("assets/tile.png", tile_size);

    this.width = width;
    this.height = height;
    this.max_gen= max_gen;

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

    this.generate([100,100,100]);
    this.add_prop(new Belt(new Point(3,3), Facing.UP));
    this.add_prop(new Belt(new Point(3,2), Facing.RIGHT));
    this.add_prop(new Belt(new Point(4,2), Facing.RIGHT));
    this.add_prop(new Belt(new Point(5,2), Facing.DOWN));
    this.add_prop(new Belt(new Point(5,3), Facing.LEFT));
    this.add_prop(new Belt(new Point(4,3), Facing.LEFT));
  }

  public render(data : GameData, cam : Point) {
    let img = new Image();
    img.src = 'assets/background.png';
    data.ctx.drawImage(img, -100 - cam.x/10, -100 - cam.y/10);

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
        p.render(data, this.tileset, p.pos.x*tile_size - cam.x, p.pos.y*tile_size - cam.y);
      }
    }
  }

  public generate(req: number[]) {
    let queue: [Point, number][] = [];
    let seed: Point = new Point(rand_int(this.width), rand_int(this.height));

    for(let k = 0; k < 3; k++) {
      for(let i = 0; i < req[k]; i++) {
        while(this.ground[seed.x][seed.y])
          seed = new Point(rand_int(this.width), rand_int(this.height));
        console.log(seed)
        console.log(this.ground[0]);
        this.ground[seed.x][seed.y] = new Tile(k, 100);

        let to_fill: number[][] = [];
        for(let j = 0; j < 8; j++)
          to_fill.push([rand_int(3)-1, rand_int(3)-1]);

        for(let idx of to_fill) {
          let new_pos = seed;
          new_pos.x += idx[0];
          new_pos.y += idx[1];

          if(i < req[k] && new_pos.is_valid(this.width, this.height) && !this.ground[new_pos.x][new_pos.y]) {
            this.ground[new_pos.x][new_pos.y] = new Tile(k, 100);
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
          this.ground[new_pos.x][new_pos.y] = new Tile(Resource.MATTER, 100);
          queue.push([new_pos, cur_gen+1]);
        }
      }
    }
  }

  public empty(p : Point) {
    let i = Math.floor(p.x/tile_size);
    let j = Math.floor(p.y/tile_size);
    if (i < 0 || i >= this.width) return true;
    if (j < 0 || j >= this.width) return true;
    return (this.ground[i][j] == null);
  }

  public add_prop(p : Prop) {
    let i = p.pos.x;
    let j = p.pos.y;
    if (i in this.surface) {
      if (j in this.surface[i]) {
        alert("Trying to add prop to occupied space.");
      } else {
        this.surface[i][j] = p;
      }
    } else {
      this.surface[i] = {};
      this.surface[i][j] = p;
    }
  }

  public get_prop(p : Point) : Prop | null {
    if (p.x in this.surface)
      if (p.y in this.surface[p.x])
        return this.surface[p.x][p.y];
    return null;
  }
}
