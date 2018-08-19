class Asteroid {
  map : Map;

  constructor(map : Map) {
    this.map = map;
  }

  public tick() {
  }

  public render(data : GameData) {
    let ctx = data.ctx;
    this.map.render(data);
  }
}
