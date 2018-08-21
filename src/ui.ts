interface UIElement {
  width: number;
  height: number;
  screen_pos: Point;

  render(data: GameData) : void;
  on_click(data: GameData) : void;
  tick(player_data: PlayerData) : void;
}

class SelectionButton implements UIElement {
  width: number;
  height: number;
  pressed : number;
  tileset : Tileset;
  screen_pos  : Point;
  tileset_pos : Point;

  switch_to : BuildingType;

  constructor(tileset: Tileset, screen_pos: Point, tileset_pos: Point, switch_to: BuildingType) {
    this.pressed = 0;
    this.tileset = tileset;
    this.screen_pos = screen_pos;
    this.tileset_pos = tileset_pos;

    this.switch_to = switch_to;
    this.width = tileset.tile_width;
    this.height = tileset.tile_height;
  }

  public render(data: GameData) {
    let [tx, ty] = [this.tileset_pos.x, this.tileset_pos.y];
    if(this.pressed) { tx += 1; }
    this.tileset.draw(data, tx, ty, this.screen_pos.x, this.screen_pos.y);
  }

  public tick(player_data: PlayerData) {
    if(this.pressed) player_data.selected_building = this.switch_to;
  }

  public on_click(data: GameData) {
    this.toggle();
  }

  private toggle() { this.pressed = (this.pressed+1) % 2; }
}

class MineralCounter implements UIElement {
  width: number;
  height: number;
  screen_pos: Point;

  construction_parts: number;

  constructor(width: number, height: number, screen_pos: Point) {
    this.width = width;
    this.height = height;
    this.screen_pos = screen_pos;
    this.construction_parts = 0;
  }

  public tick(player_data: PlayerData) {
    this.construction_parts = player_data.construction_parts;
  }

  public render(data: GameData) {
    data.ctx.fillStyle = 'white';
    data.ctx.font="13px Arial";
    data.ctx.fillText("CP: " + this.construction_parts, this.screen_pos.x, this.screen_pos.y);
  }

  public on_click(data: GameData) {}
}

class FuelInfo implements UIElement {
  width: number;
  height: number;
  screen_pos: Point;

  fuel: number;

  constructor(width: number, height: number, screen_pos: Point) {
    this.width = width;
    this.height = height;
    this.screen_pos = screen_pos;
    this.fuel = 0;
  }

  public tick(player_data: PlayerData) {
    this.fuel = player_data.fuel;
  }

  public render(data: GameData) {
    data.ctx.fillStyle = 'white';
    data.ctx.font="13px Arial";
    data.ctx.fillText("Fuel: " + this.fuel, this.screen_pos.x, this.screen_pos.y);
  }

  public on_click(data: GameData) {}
}
