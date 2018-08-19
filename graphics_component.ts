abstract class GraphicsComponent {
  constructor(){}
  public abstract render(data: GameData, entity: Entity): void;
}

class PlayerGraphicsComponent {
  constructor() {}
  public render(data: GameData, entity: Entity) {
    let avatar = new Image();
    avatar.src = 'player.png'
    data.ctx.drawImage(avatar, (data.width-avatar.width)/2, (data.height-avatar.height)/2);
  }
}
