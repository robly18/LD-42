// [M/W/U/N][000~100]

class Map {
  width :  number;
  height : number;

  ground:  string[][];
  surface: string[][];

  constructor(width : number, height : number) {
    this.width = width;
    this.height = height;

    this.ground = [];
    this.surface = []
    for(let i = 0; i < width; i++) {
      this.ground[i]  = [];
      this.surface[i] = [];
      for(let j = 0; j < height; j++) {
        this.ground[i][j]  = 'N000';
        this.surface[i][j] = 'N000';
      }
    }
  }
}
