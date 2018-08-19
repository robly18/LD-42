// [M/W/U/N][000~100]

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
  width :  number;
  height : number;

  ground:  (Tile | null)[][];
  surface: (Prop | null)[][];

  tileset : Tileset;

  constructor(width : number, height : number) {
    this.tileset = new Tileset("tile.png");

    this.width = width;
    this.height = height;

    this.ground = [];
    this.surface = [];
    for(let i = 0; i < width; i++) {
      this.ground[i]  = [];
      this.surface[i] = [];
      for(let j = 0; j < height; j++) {
        this.ground[i][j]  = new Tile(Resource.MATTER, 100);
        this.surface[i][j] = null;
      }
    }
  }

  render(data : GameData) {
    for(let i = 0; i < this.width; i++) {
      for(let j = 0; j < this.height; j++) {
        let g = this.ground[i][j]
        if (g != null) {
          g.render(data, this.tileset, i*tile_size, j*tile_size);
        }
        //this.surface[i][j].render(data, this.tileset, i*tilesize, j*tilesize);
      }
    }
  }
}
