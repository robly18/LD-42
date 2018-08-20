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

  public plus(other : Point) : Point {
    return new Point(this.x + other.x, this.y + other.y);
  }
  public minus(other : Point) : Point {
    return new Point(this.x - other.x, this.y - other.y);
  }
  public times(other : number) : Point {
    return new Point(this.x * other, this.y * other);
  }
  public dot(other : Point) : number {
    return this.x * other.x + this.y * other.y;
  }
} 

function rand_int(b: number) {
  return Math.floor(Math.random() * b);
}

function dir_to_vector(d : Facing) {
  switch (d) {
  case Facing.UP: return new Point(0,-1);
  case Facing.DOWN: return new Point(0,1);
  case Facing.RIGHT: return new Point(1,0);
  case Facing.LEFT: return new Point(-1,0);
  }
}