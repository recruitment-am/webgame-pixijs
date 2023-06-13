export default class Knight {
  x = 0;
  y = 0;

  speedX: number = 0;
  speedY: number = 0;

  // controlled by user input
  moveY: number = 0;
  moveX: number = 0;

  private maxSpeed: number = 27;
  private movingInertia: number = 15;

  update(delta: number) {
    // speed-based movement
    this.x += (delta / 1000) * this.speedX;
    this.y += (delta / 1000) * this.speedY;

    // inputs have impact on speed change with some easing/inertia

    const inertia = this.movingInertia;
    // manual LERP with strength defined by 'movingInertia'
    this.speedX = (this.speedX * inertia + this.moveX * this.maxSpeed) / (inertia + 1);
    this.speedY = (this.speedY * inertia + this.moveY * this.maxSpeed) / (inertia + 1);
  }
}
