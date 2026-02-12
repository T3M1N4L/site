<script lang="ts">
  import { onMount } from "svelte";
  import { GengarType } from "./gengar-type";

  let gengarEl: HTMLImageElement;
  let collisionEl: HTMLDivElement;
  let bubbleEl: HTMLImageElement;
  let pokeballEl: HTMLDivElement;
  let gengar: GengarType | null = null;
  let animationInterval: ReturnType<typeof setInterval>;
  let spawned = false;

  const GENGAR_SIZE = 48;

  onMount(() => {
    // Small delay to ensure container is rendered with proper dimensions
    setTimeout(() => {
      gengar = new GengarType(
        gengarEl,
        collisionEl,
        bubbleEl,
        0,
        0,
        GENGAR_SIZE,
      );

      // Start pokeball animation
      pokeballEl.classList.add("pokeball-open");

      // Show gengar partway through the pokeball animation
      const spawnDelay = 315; // 0.7 * 450ms
      const spawnTimeout = setTimeout(() => {
        if (!spawned) {
          spawned = true;
          gengarEl.classList.add("spawn-pop");
          gengarEl.style.opacity = "1";
        }
      }, spawnDelay);

      // When pokeball animation ends, remove it and ensure gengar is visible
      pokeballEl.addEventListener("animationend", (e) => {
        if ((e as AnimationEvent).animationName !== "pokeball-open") return;
        pokeballEl.style.display = "none";
        clearTimeout(spawnTimeout);
        if (!spawned) {
          spawned = true;
          gengarEl.classList.add("spawn-pop");
          gengarEl.style.opacity = "1";
        }
      });

      // Animation loop
      animationInterval = setInterval(() => {
        if (gengar) {
          gengar.nextFrame();
        }
      }, 100);

      // Handle hover - stop and show bubble like vscode-pokemon
      collisionEl.addEventListener("mouseover", () => {
        if (gengar) {
          gengar.swipe();
        }
      });
    }, 100);

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  });
</script>

<div bind:this={pokeballEl} class="pokeball-sprite"></div>

<img
  bind:this={gengarEl}
  src="/gengar/default_idle_8fps.gif"
  alt="Gengar"
  class="gengar"
  style="opacity: 0;"
/>

<div bind:this={collisionEl} class="collision"></div>

<img bind:this={bubbleEl} class="bubble" alt="Happy face" />

<style>
  .pokeball-sprite {
    --frame-size: 64px;
    --frames: 6;
    position: absolute;
    bottom: 0;
    left: 0;
    width: var(--frame-size);
    height: var(--frame-size);
    background-image: url('/gengar/pokeball_sprite_sheet.png');
    background-repeat: no-repeat;
    background-position: 0 0;
    background-size: var(--frame-size) calc(var(--frame-size) * var(--frames));
    image-rendering: pixelated;
    z-index: 9997;
  }

  .pokeball-sprite:global(.pokeball-open) {
    animation: pokeball-open 0.45s steps(var(--frames)) forwards;
  }

  @keyframes pokeball-open {
    to {
      background-position-y: calc(-1 * var(--frame-size) * var(--frames));
    }
  }

  .gengar {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 9999;
    user-select: none;
    pointer-events: none;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  .gengar:global(.spawn-pop) {
    animation: pokemon-pop 150ms ease-out;
    opacity: 1 !important;
    will-change: transform, opacity, filter;
  }

  @keyframes pokemon-pop {
    0% {
      transform: scale(0.4);
      opacity: 0;
      filter: saturate(0) brightness(3) contrast(1);
    }
    40% {
      filter: saturate(0.3) brightness(1.8) contrast(1.05);
    }
    60% {
      transform: scale(1.15);
      opacity: 1;
      filter: saturate(0.8) brightness(1.1) contrast(1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
      filter: none;
    }
  }

  .collision {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 10000;
    cursor: pointer;
    pointer-events: auto;
  }

  .bubble {
    position: absolute;
    width: 32px;
    height: 32px;
    z-index: 9998;
    user-select: none;
    pointer-events: none;
    display: none;
  }
</style>
