<svelte:options tag={null} />

<script lang="ts">
  import { l } from "../../shared/util";

  export let core: string;
  export let corevalue: string;
  $: coreLabel = l(`Core.${core}`);
  export let attribute1: string;
  export let attribute1value: string;
  $: attribute1Label = l(`Attr.${attribute1}`);
  export let attribute2: string;
  export let attribute2value: string;
  $: attribute2Label = l(`Attr.${attribute2}`);
</script>

<div class="crypt-core-triad">
  <h3>{coreLabel}</h3>
  <div class="cores">
    <crypt-input
      size="large"
      name="data.core.{core}.value"
      value={corevalue}
      data-dtype="Number"
    />
    <div class="crypt-core-triad-attribute">
      <crypt-input
        size="small"
        name="data.core.{core}.attributes.{attribute1}.value"
        value={attribute1value}
      />
      <h4
        class="rollable"
        data-roll-core={core}
        data-roll-attribute={attribute1}
      >
        {attribute1Label}
      </h4>
    </div>
    <div class="crypt-core-triad-attribute">
      <crypt-input
        size="small"
        name="data.core.{core}.attributes.{attribute2}.value"
        value={attribute2value}
      />
      <h4
        class="rollable"
        data-roll-core={core}
        data-roll-attribute={attribute2}
      >
        {attribute2Label}
      </h4>
    </div>
  </div>
</div>

<!--
  @Input core: Core;
  @Input attrL: Attribute;
  @Input attrR: Attribute;
-->
<!-- <div class="crypt-core-triad">
  <div class="label core">{{ core.label }}</div>
  <div class="triad-wrapper">
    <div class="triangle">
      <svg viewbox="0 0 210 80">
        <polygon points="105,25 190,60 20,60 105,25" class="triangle" />
      </svg>
    </div>
    <div class="core-container core">
      {{> "systems/cryptomancer/shared/components/core-input/core-input.hbs"
      size="large" name=(concat "data.core." core.key ".value") value=core.value
      }}
    </div>
    <div class="core-container attribute left">
      {{> "systems/cryptomancer/shared/components/core-input/core-input.hbs"
      size="small" name=(concat "data.core." core.key ".attributes." attrL.key
      ".value") value=attrL.value }}
      <div
        class="label attribute left rollable"
        data-roll-core="{{ attrL.core }}"
        data-roll-attribute="{{ attrL.key }}"
      >
        {{ attrL.label }}
      </div>
    </div>
    <div class="core-container attribute right">
      {{> "systems/cryptomancer/shared/components/core-input/core-input.hbs"
      size="small" name=(concat "data.core." core.key ".attributes." attrR.key
      ".value") value=attrR.value }}
      <div
        class="label attribute right rollable"
        data-roll-core="{{ attrR.core }}"
        data-roll-attribute="{{ attrR.key }}"
      >
        {{ attrR.label }}
      </div>
    </div>
  </div>
</div> -->
