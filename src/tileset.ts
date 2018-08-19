
class Tileset {
  img : HTMLImageElement;
  tile_width : number;
  tile_height: number;
  constructor(src : string, tile_width : number, tile_height : number = tile_width) {
    this.img = new Image();
    this.img.src = src;
    this.tile_width = tile_width;
    this.tile_height = tile_height;
  }
  draw(data : GameData, tx : number, ty : number, x : number, y : number) {
    let tile_width = this.tile_width;
    let tile_height = this.tile_height;
    data.ctx.drawImage(this.img, tx*tile_size, ty*tile_height, tile_width, tile_height,
                                  x          ,  y            , tile_width, tile_height);
  }
}