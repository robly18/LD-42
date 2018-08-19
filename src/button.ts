class Button {
  width: number;
  height: number;

  pointer: number;
  images: HTMLImageElement[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pointer = 0;
  }

  public add_image(img : HTMLImageElement) {
    this.images.push(img);
  }

  public toggle() {
    pointer += 1;
    pointer %= 2;
  }

  public get_image() {
    return images[pointer];
  }
}
