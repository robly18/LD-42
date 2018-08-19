abstract class State {
  data : GameData;
	
  constructor(data : GameData) {
    this.data = data;
  }

  tick() : State {return this;}
  render() {}
}

class MenuState extends State {
  carry_t : number;
  secno : number;
  constructor(data : GameData) {
    super(data);
    this.carry_t = 0;
    this.secno = 0;
  }

  tick() : State {
    this.carry_t += this.data.dt();
    while(this.carry_t > 1000) {
      this.carry_t -= 1000;
      this.secno += 1;
      console.log("It has been ",this.secno," seconds.");
    }
    return this;
  }
  
}