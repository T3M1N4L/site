<script lang="ts">
  import Icon from "@iconify/svelte";
</script>

<div class="soc paper filled">
  <a class="no-style" style="--color: #5865F2;" title="Discord" href="https://discord.com/users/861917446750863402"><Icon icon="fa7-brands:discord" width={32} /></a>
  <a class="no-style" title="GitHub" href="https://github.com/T3M1N4L"><Icon icon="fa7-brands:github-alt" width={32} /></a>
  <a class="no-style" style="--color: #a057fe" title="email" href="mailto:t3rm1n4l9727@proton.me"><Icon icon="material-symbols:mail" width={32} /></a>
  <a class="no-style" style="--color: #FF4500;" title="reddit" href="https://reddit.com/user/t3rm1n4l_"><Icon icon="fa7-brands:reddit" width={32} /></a>
  <a class="no-style" title="X (formerly Twitter)" href="https://x.com/t3rm1n4l_dev"><Icon icon="fa7-brands:x-twitter" width={32} /></a>

</div>

<style lang="scss">
.soc {
display: flex;
overflow: hidden;
border: 1px solid oklch(var(--surface1) / 0.5);
border-radius:16px;
transition: transform 0.5s var(--bounce);
&:hover {
transform: scale(1.02);
}
@media screen and (max-width:600px) {
flex-wrap: wrap;
overflow: visible;
}

& > a {
--color: white;
flex: 1;
height: 100px;
display: flex;
align-items: center;
justify-content: center;
min-width: 64px;
transition: flex .45s var(--bounce-weak), scale .3s var(--bounce), filter .75s, color .2s;
border-right: 1px solid rgba(255,255,255,0.1);

@media screen and (max-width:500px) {
min-width: 33.33%;
flex: 1!important;

& {
scale: 1!important;
}
}

      :global(svg) {
        transition: scale .3s var(--bounce-weak);
        scale: 1.1;
      }

&:hover {
flex: 2;
        color: var(--color); 
        opacity: 0.85;

        :global(svg) {
          scale: 3!important;
          filter: drop-shadow(0 0 20px var(--color));
        }
}

      

scale: 0.75;
opacity: 0.5;

&:last-child {
border-right: none;
}
}
}
</style>
