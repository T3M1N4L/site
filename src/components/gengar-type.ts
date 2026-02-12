import {
  States,
  HorizontalDirection,
  FrameResult,
  resolveState,
} from './gengar-states';
import type { IState, IGengar } from './gengar-states';

interface ISequenceState {
  state: States;
  possibleNextStates: States[];
}

export class GengarType implements IGengar {
  currentState: IState;
  currentStateEnum: States;
  holdState: IState | undefined;
  holdStateEnum: States | undefined;
  private el: HTMLImageElement;
  private collision: HTMLDivElement;
  private speech: HTMLImageElement;
  private _left: number;
  private _bottom: number;
  private _speed: number = 2;
  private _width: number;

  sequence: ISequenceState[] = [
    {
      state: States.sitIdle,
      possibleNextStates: [States.walkLeft, States.walkRight],
    },
    {
      state: States.walkLeft,
      possibleNextStates: [States.sitIdle, States.walkRight],
    },
    {
      state: States.walkRight,
      possibleNextStates: [States.sitIdle, States.walkLeft],
    },
  ];

  constructor(
    spriteElement: HTMLImageElement,
    collisionElement: HTMLDivElement,
    speechElement: HTMLImageElement,
    left: number,
    bottom: number,
    width: number,
  ) {
    this.el = spriteElement;
    this.collision = collisionElement;
    this.speech = speechElement;
    this._left = left;
    this._bottom = bottom;
    this._width = width;

    this.initSprite(left, width);

    this.currentStateEnum = States.sitIdle;
    this.currentState = resolveState(this.currentStateEnum, this);
  }

  initSprite(left: number, width: number) {
    this.el.style.left = `${left}px`;
    this.el.style.width = `${width}px`;
    this.el.style.height = `${width}px`;

    this.collision.style.left = `${left}px`;
    this.collision.style.width = `${width}px`;
    this.collision.style.height = `${width}px`;

    this.speech.style.left = `${left}px`;
    this.speech.style.bottom = `${width}px`;
    this.speech.style.display = 'none';
  }

  get left(): number {
    return this._left;
  }

  get bottom(): number {
    return this._bottom;
  }

  get speed(): number {
    return this._speed;
  }

  get width(): number {
    return this._width;
  }

  get containerWidth(): number {
    // Use the grandparent (.inner) width for full navbar span
    const grandparent = this.el.parentElement?.parentElement;
    return grandparent?.clientWidth || this.el.parentElement?.clientWidth || 200;
  }

  get isMoving(): boolean {
    return this._speed > 0;
  }

  positionLeft(left: number): void {
    // Clamp to container bounds
    const containerW = this.containerWidth;
    const maxLeft = Math.max(0, containerW - this._width);
    this._left = Math.max(0, Math.min(left, maxLeft));
    this.el.style.left = `${this._left}px`;
    this.collision.style.left = `${this._left}px`;
    this.speech.style.left = `${this._left}px`;
  }

  positionBottom(bottom: number): void {
    this._bottom = bottom;
  }

  faceLeft() {
    this.el.style.transform = 'scaleX(-1)';
  }

  faceRight() {
    this.el.style.transform = 'scaleX(1)';
  }

  setAnimation(spriteLabel: string) {
    const filename =
      spriteLabel === 'idle'
        ? 'default_idle_8fps.gif'
        : 'default_walk_8fps.gif';

    // Only update if different to avoid restarting the GIF
    if (this.el.src.includes(filename)) {
      return;
    }
    this.el.src = `/gengar/${filename}`;
  }

  showSpeechBubble(duration: number = 2000) {
    this.speech.src = '/img/happy.png';
    this.speech.style.display = 'block';
    this.speech.style.bottom = `${this._width}px`;
    setTimeout(() => {
      this.speech.style.display = 'none';
    }, duration);
  }

  swipe() {
    if (this.currentStateEnum === States.swipe) {
      return;
    }
    this.holdState = this.currentState;
    this.holdStateEnum = this.currentStateEnum;
    this.currentStateEnum = States.swipe;
    this.currentState = resolveState(this.currentStateEnum, this);
    this.showSpeechBubble();
  }

  chooseNextState(fromState: States): States {
    for (let i = 0; i < this.sequence.length; i++) {
      if (this.sequence[i].state === fromState) {
        const possibleNextStates = this.sequence[i].possibleNextStates;
        const idx = Math.floor(Math.random() * possibleNextStates.length);
        return possibleNextStates[idx];
      }
    }
    return States.sitIdle;
  }

  nextFrame() {
    // Handle facing direction (skip for swipe to keep current direction)
    if (this.currentState.horizontalDirection === HorizontalDirection.left) {
      this.faceLeft();
    } else if (this.currentState.horizontalDirection === HorizontalDirection.right) {
      this.faceRight();
    }

    // Set the animation sprite
    this.setAnimation(this.currentState.spriteLabel);

    // Execute frame logic
    const frameResult = this.currentState.nextFrame();

    // Handle state transitions
    if (frameResult === FrameResult.stateComplete) {
      // If recovering from swipe, restore previous state
      if (this.holdState && this.holdStateEnum) {
        this.currentState = this.holdState;
        this.currentStateEnum = this.holdStateEnum;
        this.holdState = undefined;
        this.holdStateEnum = undefined;
        return;
      }

      const nextState = this.chooseNextState(this.currentStateEnum);
      this.currentState = resolveState(nextState, this);
      this.currentStateEnum = nextState;
    }
  }
}
