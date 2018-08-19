abstract class GraphicsComponent {
  constructor(){}
  public abstract render(data: GameData, entity: Entity): void;
}
