import Fruit from './elements/Fruit';
import Knight from './elements/Knight';

export default class CollisionDetector {
  private static THRESHOLD_X = 1.3;
  private static THRESHOLD_Y = 2.8;

  constructor(private activeFruits: Fruit[], private knight: Knight) {}

  checkForCollisions() {
    const { knight } = this;
    return this.activeFruits.filter((fruit) => {
      // too high
      if (fruit.z > CollisionDetector.THRESHOLD_Y * 2) return false;

      return (
        Math.abs(knight.x - fruit.x) < CollisionDetector.THRESHOLD_X &&
        Math.abs(knight.y - fruit.y) < CollisionDetector.THRESHOLD_Y
      );
    });
  }

  checkForFalls() {
    return this.activeFruits.filter((fruit) => {
      // reached the floor
      return fruit.state === 'falling' && fruit.z < 0;
    });
  }
}
