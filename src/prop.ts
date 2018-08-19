abstract class Prop {
  pos : Point;
  constructor(pos: Point) {
    this.pos = pos;
  }
  public render(data : GameData, ts : Tileset, x : number, y : number) {
    let [tx, ty] = this.tilePos();
    ts.draw(data, tx, ty, x, y);
  }

  protected abstract tilePos() : [number, number];
}

class Mine extends Prop {
  constructor(pos: Point) {
    super(pos);
  }
  public render(data : GameData, ts : Tileset, x : number, y : number) {
    let [tx, ty] = this.tilePos();
    ts.draw(data, tx, ty, x, y);
  }

  protected tilePos() : [number, number] {
    return [0,1];
  }
}
