class Asteroid {
  map : Map;

  constructor(map : Map) {
    this.map = map;
  }

  public tick() {
  }

  public render(data : GameData, cam : Point) {
    let ctx = data.ctx;
    this.map.render(data, cam);
  }
}
