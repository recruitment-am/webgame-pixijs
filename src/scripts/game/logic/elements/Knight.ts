export default class Knight {
  x = 0;
  y = 0;

  speedX = 0;
  speedY = 0;

  // controlled by user input
  moveY = 0;
  moveX = 0;

  private maxSpeed = 27;
  private movingInertia = 15;

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
