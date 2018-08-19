
const tile_size = 32;

enum Resource {
  MATTER, ICE, URANIUM
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

class Tileset {
  img : HTMLImageElement;
  constructor(src : string) {
    this.img = new Image();
    this.img.src = src;
  }
  draw(data : GameData, tx : number, ty : number, x : number, y : number) {
    data.ctx.drawImage(this.img, tx*tile_size, ty*tile_size, tile_size, tile_size,
                                  x          ,  y          , tile_size, tile_size);
  }
}

class Map {
  width : number;
  height : number;
  chunk_size: number;

  ground:  (Tile | null)[][];
  surface: (Prop | null)[][];

  tileset : Tileset;

  constructor(width : number, height : number, chunk_size: number) {
    this.tileset = new Tileset("tile.png");

    this.width = width;
    this.height = height;
    this.chunk_size = chunk_size;

    this.ground = [];
    this.surface = [];
    this.init();
  }

  private init() {
    for(let i = 0; i < this.width; i++) {
      this.ground[i]  = [];
      this.surface[i] = [];
      for(let j = 0; j < this.height; j++) {
        this.ground[i][j]  = null;
        this.surface[i][j] = null;
      }
    }

    this.generate(3000);
  }

  public render(data : GameData, cam : Point) {
    let nwx = Math.max(Math.floor(cam.x/tile_size), 0);
    let nwy = Math.max(Math.floor(cam.y/tile_size), 0);
    let sex = Math.min(Math.ceil((cam.x + data.width)/tile_size), this.width-1);
    let sey = Math.min(Math.ceil((cam.y + data.height)/tile_size), this.height-1);
    console.log(nwx, nwy, sex, sey);
    for(let i = nwx; i <= sex; i++) {
      for(let j = nwy; j <= sey; j++) {
        let g = this.ground[i][j]
        if (g != null) {
          g.render(data, this.tileset, i*tile_size - cam.x, j*tile_size - cam.y);
        }
        let p = this.surface[i][j];
        if (p != null) {
          p.render(data, this.tileset, i*tile_size - cam.x, j*tile_size - cam.y);
        }
      }
    }
  }

  public generate(num_blocks: number) {
    let cur_blocks = 0;
    let seed: Point;
    let queue: Point[] = [];

    seed = new Point(rand_int(this.width), rand_int(this.height));
    this.ground[seed.x][seed.y] = new Tile(Resource.MATTER, 100);
    queue.push(seed);

    while(queue.length > 0 && cur_blocks < num_blocks) {
      for(let i = 0; i < this.chunk_size && queue.length > 0; i++) {
        let cur_pos : Point = queue[0];
        queue.shift();

        let to_fill : number[] = [];
        for(let j = 0; j < 4; j++)
          to_fill.push(rand_int(4));

        for(let idx of to_fill) {
          let new_pos: Point = cur_pos;
          if(idx == 0) new_pos.x += 1;
          if(idx == 1) new_pos.x -= 1;
          if(idx == 2) new_pos.y += 1;
          if(idx == 3) new_pos.y -= 1;

          if(new_pos.is_valid(this.width, this.height) && !this.ground[new_pos.x][new_pos.y]) {
            this.ground[new_pos.x][new_pos.y] = new Tile(Resource.MATTER, 100);
            queue.push(new_pos);
          }
        }
        cur_blocks++;
      }

      seed = new Point(rand_int(this.width), rand_int(this.height));
      while(this.ground[seed.x][seed.y])
        seed = new Point(rand_int(this.width), rand_int(this.height));
      queue = [seed];
    }
  }
}
