# Webgame made with Pixi.js

To run the game run following command:

```
npm install && npm start
```


--------


## Project structure

- The application is made with React for initial menu and Pixi.js as a WebGL renderer
- Menu: `src/index.html` + `src/App` + `src/splash/*`
- Game: entrypoint `src/game/Game.tsx` incl. the canvas initializer + sources at `src/scripts/game`


## Game

- Game is divided into three parts: `logic`, `systems` and `view`. There is also a `controller` which connects view (browser's input) and controls the model of knight character.
- `logic` is the reusable model of the game, the "business" logic, that is separated from the view implementation and may be used to render on another engine; such classes like `LivesCounter` or `FruitsGenerator` might be collected into logic-systems within the logic itself; for modularity it was extracted to separate files, but it might become part of i.e. Knight (lives), or a general game state model (which is not present in the solution right now)
- `systems` folder is the place for general-purpose scripts, utils, helper tools, that are static and not related to the particular gameplay.
- `view` consists of all visual elements seen in the game. Components here listens to related model elements and displays the state appropriately.
- `controllers` groups client-specific classes that bounds external sources of changes, like user input or remote signals (i.e. websockets, fetching data)
- `GameScene.ts` wraps/bounds logic, systems and the view into an application, it also loads necessary assets


## Game's `logic`

- The core of the game logic is its GameLoop, which provides implementation of detecting time passing and updating all subsequent states beneath
- There are some sub-models created and updated on a tick-base



## Controls

Use **arrows** or **WSAD** to move the knight and collect falling fruits.
Game gets more difficult over time.

You can control amount of lives by adding `?lives=10` to the browsers "query".