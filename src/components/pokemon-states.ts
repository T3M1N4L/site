export enum HorizontalDirection {
  left,
  right,
  natural,
}

export enum FrameResult {
  stateContinue,
  stateComplete,
}

export enum States {
  sitIdle = 'sit-idle',
  walkRight = 'walk-right',
  walkLeft = 'walk-left',
  swipe = 'swipe',
}

export interface IPokemon {
  left: number;
  bottom: number;
  speed: number;
  width: number;
  containerWidth: number;
  isMoving: boolean;
  positionLeft(left: number): void;
  positionBottom(bottom: number): void;
}

export interface IState {
  label: States;
  spriteLabel: string;
  horizontalDirection: HorizontalDirection;
  pokemon: IPokemon;
  nextFrame(): FrameResult;
}

class AbstractStaticState implements IState {
  label = States.sitIdle;
  idleCounter: number;
  spriteLabel = 'idle';
  holdTime = 50;
  pokemon: IPokemon;
  horizontalDirection = HorizontalDirection.right;

  constructor(pokemon: IPokemon) {
    this.idleCounter = 0;
    this.pokemon = pokemon;
  }

  nextFrame(): FrameResult {
    this.idleCounter++;
    if (this.idleCounter > this.holdTime) {
      return FrameResult.stateComplete;
    }
    return FrameResult.stateContinue;
  }
}

export class SitIdleState extends AbstractStaticState {
  label = States.sitIdle;
  spriteLabel = 'idle';
  horizontalDirection = HorizontalDirection.right;
  holdTime = 35;
}

export class SwipeState extends AbstractStaticState {
  label = States.swipe;
  spriteLabel = 'idle';
  horizontalDirection = HorizontalDirection.natural;
  holdTime = 15;
}

export class WalkRightState implements IState {
  label = States.walkRight;
  pokemon: IPokemon;
  spriteLabel = 'walk';
  horizontalDirection = HorizontalDirection.right;
  speedMultiplier = 1;
  idleCounter: number;
  holdTime = 60;

  constructor(pokemon: IPokemon) {
    this.pokemon = pokemon;
    this.idleCounter = 0;
  }

  nextFrame(): FrameResult {
    this.idleCounter++;
    
    // Only move after a few frames to ensure animation has switched from idle to walk
    if (this.idleCounter > 2) {
      this.pokemon.positionLeft(
        this.pokemon.left + this.pokemon.speed * this.speedMultiplier,
      );
    }

    // Get current boundary dynamically
    const rightBoundary = this.pokemon.containerWidth - this.pokemon.width;

    if (
      this.pokemon.isMoving &&
      this.pokemon.left >= rightBoundary
    ) {
      return FrameResult.stateComplete;
    } else if (!this.pokemon.isMoving && this.idleCounter > this.holdTime) {
      return FrameResult.stateComplete;
    }
    return FrameResult.stateContinue;
  }
}

export class WalkLeftState implements IState {
  label = States.walkLeft;
  spriteLabel = 'walk';
  horizontalDirection = HorizontalDirection.left;
  pokemon: IPokemon;
  speedMultiplier = 1;
  idleCounter: number;
  holdTime = 60;

  constructor(pokemon: IPokemon) {
    this.pokemon = pokemon;
    this.idleCounter = 0;
  }

  nextFrame(): FrameResult {
    this.idleCounter++;
    
    // Only move after a few frames to ensure animation has switched from idle to walk
    if (this.idleCounter > 2) {
      this.pokemon.positionLeft(
        this.pokemon.left - this.pokemon.speed * this.speedMultiplier,
      );
    }

    // Stop at left edge of container (0) - don't stop randomly in the middle
    if (this.pokemon.isMoving && this.pokemon.left <= 0) {
      return FrameResult.stateComplete;
    } else if (!this.pokemon.isMoving && this.idleCounter > this.holdTime) {
      return FrameResult.stateComplete;
    }
    return FrameResult.stateContinue;
  }
}

export function resolveState(state: States, pokemon: IPokemon): IState {
  switch (state) {
    case States.sitIdle:
      return new SitIdleState(pokemon);
    case States.walkRight:
      return new WalkRightState(pokemon);
    case States.walkLeft:
      return new WalkLeftState(pokemon);
    case States.swipe:
      return new SwipeState(pokemon);
    default:
      return new SitIdleState(pokemon);
  }
}
