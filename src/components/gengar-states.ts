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

export interface IGengar {
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
  gengar: IGengar;
  nextFrame(): FrameResult;
}

class AbstractStaticState implements IState {
  label = States.sitIdle;
  idleCounter: number;
  spriteLabel = 'idle';
  holdTime = 50;
  gengar: IGengar;
  horizontalDirection = HorizontalDirection.right;

  constructor(gengar: IGengar) {
    this.idleCounter = 0;
    this.gengar = gengar;
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
  gengar: IGengar;
  spriteLabel = 'walk';
  horizontalDirection = HorizontalDirection.right;
  speedMultiplier = 1;
  idleCounter: number;
  holdTime = 60;

  constructor(gengar: IGengar) {
    this.gengar = gengar;
    this.idleCounter = 0;
  }

  nextFrame(): FrameResult {
    this.idleCounter++;
    this.gengar.positionLeft(
      this.gengar.left + this.gengar.speed * this.speedMultiplier,
    );

    // Random chance to stop in the middle
    if (this.gengar.isMoving && Math.random() < 0.01) {
      return FrameResult.stateComplete;
    }

    // Get current boundary dynamically
    const rightBoundary = this.gengar.containerWidth - this.gengar.width;

    if (
      this.gengar.isMoving &&
      this.gengar.left >= rightBoundary
    ) {
      return FrameResult.stateComplete;
    } else if (!this.gengar.isMoving && this.idleCounter > this.holdTime) {
      return FrameResult.stateComplete;
    }
    return FrameResult.stateContinue;
  }
}

export class WalkLeftState implements IState {
  label = States.walkLeft;
  spriteLabel = 'walk';
  horizontalDirection = HorizontalDirection.left;
  gengar: IGengar;
  speedMultiplier = 1;
  idleCounter: number;
  holdTime = 60;

  constructor(gengar: IGengar) {
    this.gengar = gengar;
    this.idleCounter = 0;
  }

  nextFrame(): FrameResult {
    this.idleCounter++;
    this.gengar.positionLeft(
      this.gengar.left - this.gengar.speed * this.speedMultiplier,
    );

    // Random chance to stop in the middle
    if (this.gengar.isMoving && Math.random() < 0.01) {
      return FrameResult.stateComplete;
    }

    // Stop at left edge of container (0)
    if (this.gengar.isMoving && this.gengar.left <= 0) {
      return FrameResult.stateComplete;
    } else if (!this.gengar.isMoving && this.idleCounter > this.holdTime) {
      return FrameResult.stateComplete;
    }
    return FrameResult.stateContinue;
  }
}

export function resolveState(state: States, gengar: IGengar): IState {
  switch (state) {
    case States.sitIdle:
      return new SitIdleState(gengar);
    case States.walkRight:
      return new WalkRightState(gengar);
    case States.walkLeft:
      return new WalkLeftState(gengar);
    case States.swipe:
      return new SwipeState(gengar);
    default:
      return new SitIdleState(gengar);
  }
}
