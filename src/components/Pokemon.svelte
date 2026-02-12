<script lang="ts">
  import { onMount } from "svelte";
  import { PokemonType } from "./pokemon-type";

  export let pokemon: string = "gengar";

  let pokemonEl: HTMLImageElement;
  let collisionEl: HTMLDivElement;
  let bubbleEl: HTMLImageElement;
  let pokeballEl: HTMLDivElement;
  let pokemonInstance: PokemonType | null = null;
  let animationInterval: ReturnType<typeof setInterval>;
  let spawned = false;

  const POKEMON_SIZE = 48;

  function startAnimationLoop() {
    if (animationInterval) {
      clearInterval(animationInterval);
    }
    animationInterval = setInterval(() => {
      if (pokemonInstance) {
        pokemonInstance.nextFrame();
      }
    }, 100);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      // Pause animation when tab is hidden
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    } else {
      // Resume animation when tab becomes visible
      startAnimationLoop();
    }
  }

  onMount(() => {
    // Small delay to ensure container is rendered with proper dimensions
    setTimeout(() => {
      pokemonInstance = new PokemonType(
        pokemonEl,
        collisionEl,
        bubbleEl,
        0,
        0,
        POKEMON_SIZE,
        pokemon,
      );

      // Start pokeball animation
      pokeballEl.classList.add("pokeball-open");

      // Show pokemon partway through the pokeball animation
      const spawnDelay = 315; // 0.7 * 450ms
      const spawnTimeout = setTimeout(() => {
        if (!spawned) {
          spawned = true;
          pokemonEl.classList.add("spawn-pop");
          pokemonEl.style.opacity = "1";
        }
      }, spawnDelay);

      // When pokeball animation ends, remove it and ensure pokemon is visible
      pokeballEl.addEventListener("animationend", (e) => {
        if ((e as AnimationEvent).animationName !== "pokeball-open") return;
        pokeballEl.style.display = "none";
        clearTimeout(spawnTimeout);
        if (!spawned) {
          spawned = true;
          pokemonEl.classList.add("spawn-pop");
          pokemonEl.style.opacity = "1";
        }
      });

      // Start animation loop
      startAnimationLoop();

      // Handle visibility changes (tab switching)
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Handle hover - stop and show bubble like vscode-pokemon
      collisionEl.addEventListener("mouseover", () => {
        if (pokemonInstance) {
          pokemonInstance.swipe();
        }
      });
    }, 100);

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  });
</script>

<div bind:this={pokeballEl} class="pokeball-sprite"></div>

<img
  bind:this={pokemonEl}
  src={`/pokemon/${pokemon}/default_idle_8fps.gif`}
  alt={pokemon}
  class="pokemon-sprite"
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
    background-image: url('/pokemon/pokeball_sprite_sheet.png');
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

  .pokemon-sprite {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 9999;
    user-select: none;
    pointer-events: none;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  .pokemon-sprite:global(.spawn-pop) {
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
