// [M/W/U/N][000~100]

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
  width :  number;
  height : number;

  ground:  (Tile | null)[][];
  surface: (Prop | null)[][];

  constructor(width : number, height : number) {
    this.width = width;
    this.height = height;

    this.ground = [];
    this.surface = []
    for(let i = 0; i < width; i++) {
      this.ground[i]  = [];
      this.surface[i] = [];
      for(let j = 0; j < height; j++) {
        this.ground[i][j]  = new Tile(Resource.MATTER, 100);
        this.surface[i][j] = null;
      }
    }
  }
}
