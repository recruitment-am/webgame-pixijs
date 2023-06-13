// "better enum"
export const FruitEnum = {
  Peach: 'Peach',
  Bread: 'Bread',
  Cookie: 'Cookie',
  Onion: 'Onion',
  Apple: 'Apple',
  Cheese: 'Cheese',
  PieLemon: 'PieLemon',
  Avocado: 'Avocado',
  Lemon: 'Lemon',
  MelonWater: 'MelonWater',
  Brownie: 'Brownie',
  MelonHoneydew: 'MelonHoneydew',
} as const;

export type FruitEnumType = (typeof FruitEnum)[keyof typeof FruitEnum];
export const FruitEnumEntries = Object.values(FruitEnum);
