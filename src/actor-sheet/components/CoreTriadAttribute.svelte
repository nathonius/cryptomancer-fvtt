<svelte:options tag={null} />

<script lang="ts">
  import { l } from "../../shared/util";

  export let attribute: string;
  export let core: string;
</script>

<div class="crypt-core-triad-attribute">
  <crypt-core-input size="small" {...$$restProps} />
  <h4 class="rollable" data-roll-core={core} data-roll-attribute={attribute}>
    {l(attribute)}
  </h4>
</div>
