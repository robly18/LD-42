class Point {
  x : number;
  y : number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public is_valid(width: number, height: number) {
    return this.x >= 0 && this.y >= 0 && this.x < width && this.y < height;
  }
} 

function rand_int(b: number) {
  return Math.floor(Math.random() * b);
}
