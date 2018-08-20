interface UIElement {
  width: number;
  height: number;
  screen_pos: Point;

  tick() : void;
  render(data: GameData) : void;
  on_click(data: GameData) : void;
}

class Button implements UIElement {
  width: number;
  height: number;
  pressed : number;
  tileset : Tileset;
  screen_pos  : Point;
  tileset_pos : Point;
  when_pressed : Function;
  time_pressed : number;

  constructor(tileset: Tileset, screen_pos: Point, tileset_pos: Point, when_pressed: Function) {
    this.pressed = 0;
    this.tileset = tileset;
    this.screen_pos = screen_pos;
    this.tileset_pos = tileset_pos;
    this.when_pressed = when_pressed;

    this.width = tileset.tile_width;
    this.height = tileset.tile_height;
  }

  public render(data: GameData) {
    let [tx, ty] = [this.tileset_pos.x, this.tileset_pos.y];
    if(this.pressed) { tx += 1; }
    this.tileset.draw(data, tx, ty, this.screen_pos.x, this.screen_pos.y);
  }

  public tick() {
    if(this.pressed) {
      let delta = Date.now() - this.time_pressed;
      if(delta > 1000) this.toggle();
    }
  }

  public on_click(data: GameData) {
    if(!this.pressed) {
      this.toggle();
      this.time_pressed = Date.now()

      this.when_pressed();
      console.log(data.mpos.x);
    }
  }

  private toggle() { this.pressed = (this.pressed+1) % 2; }
}
