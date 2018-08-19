enum Resource {
  MATTER, ICE, URANIUM
}

class Tile {
  type : Resource;
  quantity : number;
  constructor(type, qt) {
    this.type = type;
    this.quantity = qt;
  }
}

class Map {
  width : number;
  height : number;
  chunck_size: number;

  ground:  (Tile | null)[][];
  surface: (Prop | null)[][];
  constructor(width : number, height : number) {
    this.width = width;
    this.height = height;

    this.ground = [];
    this.surface = []
    this.init();
  }

  public set_chunck_size(new_size: number) {
    this.chunck_size = new_size;
  }
  
  private init() {
    for(let i = 0; i < this.width; i++) {
      this.ground[i]  = [];
      this.surface[i] = [];
      for(let j = 0; j < this.height; j++) {
        this.ground[i][j]  = new Tile(Resource.MATTER, 100);
        this.surface[i][j] = null;
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
      for(let i = 0; i < this.chunck_size; i++) {
        let cur_pos : Point = queue[0];
        queue.shift();

        let to_fill : number[];
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

      while(this.ground[seed.x][seed.y])
        seed = new Point(rand_int(this.width), rand_int(this.height));
      queue = [seed];
    }
  }

  public render(data: GameData) {}
}
