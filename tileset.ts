
class Tileset {
  img : HTMLImageElement;
  tile_size : number;
  constructor(src : string, tile_size : number) {
    this.img = new Image();
    this.img.src = src;
    this.tile_size = tile_size;
  }
  draw(data : GameData, tx : number, ty : number, x : number, y : number) {
    let tile_size = this.tile_size;
    data.ctx.drawImage(this.img, tx*tile_size, ty*tile_size, tile_size, tile_size,
                                  x          ,  y          , tile_size, tile_size);
  }
}