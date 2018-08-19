class Entity {
  pos : Point;
  velocity : Point;
  floating : boolean;
  constructor(pos: Point, floating : boolean = false) {
    this.pos = pos;
    this.floating = floating;
  }

  movement : MovementComponent;
  graphics : GraphicsComponent;
}

abstract class MovementComponent {
  constructor(){}
  public abstract tick(data : GameData, entity : Entity);
}

abstract class GraphicsComponent {
  constructor(){}
  public abstract render(data : GameData, entity : Entity);
}

