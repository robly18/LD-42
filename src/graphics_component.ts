abstract class GraphicsComponent {
  img: HTMLImageElement;

  constructor(img: HTMLImageElement){}
  public abstract render(data: GameData, entity: Entity): void;
}

class PlayerGraphicsComponent {
  img: HTMLImageElement;

  constructor(img: HTMLImageElement) {
    this.img = img;
  }

  public render(data: GameData, entity: Entity) {
    data.ctx.drawImage(this.img, (data.width-this.img.width)/2, (data.height-this.img.height)/2);
  }
}
