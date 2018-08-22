class SuperDuperAwesomeGalacticSpaceStarMap {
  width: number;
  height: number;
  matrix: (Map | null)[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.init();
  }

  private init() {
    for(let i = 0; i < this.width; i++)
      for(let j = 0; j < this.height; j++)
        matrix[i][j] = null;

    this.generate();
  }

  public generate() {
    for(let i = 0; i < this.width; i++)
      for(let j = 0; j < this.height; j++)
        if(rand_int(100) < 30)
          matrix[i][j] = new Map(30, 30, 25);
  }

  public dist(p1: Point, p2: Point) {
    return Math.max(Math.abs(p1.x-p2.x), Math.abs(p1.y-p2.y));
  }
}
