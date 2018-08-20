interface UIElement {
  render(data: GameData) : void;

  tick() : void;
  on_click() : void;
}

class Button implements UIElement {
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
  }

  public render(data: GameData) {
    let [tx, ty] = [this.tileset_pos.x, this.tileset_pos.y];
    if(this.pressed) { tx += 1; ty += 1; }
    this.tileset.draw(data, tx, ty, this.screen_pos.x, this.screen_pos.y);
  }

  public tick() {
    if(this.pressed) {
      let delta = Date.now() - this.time_pressed;
      if(delta > 100) this.toggle();
    }
  }

  public on_click() {
    if(!this.pressed) {
      this.toggle();
      this.time_pressed = Date.now()

      this.when_pressed();
    }
  }

  private toggle() { this.pressed = (this.pressed+1) % 2; }
}
