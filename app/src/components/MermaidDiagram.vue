<script>
import mermaid from "mermaid";

let initialized = false;

// Rounds node/entity/actor boxes to match the app's rounded-xl/2xl card
// language instead of mermaid's default sharp-cornered rectangles.
const ROUNDED_NODE_CSS = `
  .node rect, .node polygon, .cluster rect,
  .er.entityBox, .actor, .labelBox, .activation0, .activation1, .activation2 {
    rx: 10px;
    ry: 10px;
  }
  .node rect, .cluster rect, .er.entityBox, .actor {
    stroke-width: 1.5px;
  }
`;

function ensureInit() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "strict",
    fontFamily: '"Segoe UI", Roboto, system-ui, sans-serif',
    themeCSS: ROUNDED_NODE_CSS,
    themeVariables: {
      background: "#101f38",
      primaryColor: "#182b4a",
      primaryTextColor: "#f5f7fb",
      primaryBorderColor: "#e7254d",
      secondaryColor: "#182b4a",
      secondaryBorderColor: "#263a5c",
      tertiaryColor: "#0a1526",
      tertiaryBorderColor: "#263a5c",
      lineColor: "#93a4c6",
      textColor: "#f5f7fb",
      mainBkg: "#182b4a",
      nodeTextColor: "#f5f7fb",
      clusterBkg: "rgba(231, 37, 77, 0.06)",
      clusterBorder: "#263a5c",
      edgeLabelBackground: "#101f38",
      errorBkgColor: "#e7254d",
      errorTextColor: "#ffffff",
      actorBkg: "#182b4a",
      actorBorder: "#e7254d",
      actorTextColor: "#f5f7fb",
      actorLineColor: "#3c5580",
      signalColor: "#93a4c6",
      signalTextColor: "#f5f7fb",
      labelBoxBkgColor: "#182b4a",
      labelBoxBorderColor: "#263a5c",
      labelTextColor: "#f5f7fb",
      loopTextColor: "#f5f7fb",
      noteBkgColor: "#182b4a",
      noteTextColor: "#f5f7fb",
      noteBorderColor: "#e7254d",
      activationBkgColor: "#182b4a",
      activationBorderColor: "#e7254d",
      sequenceNumberColor: "#0a1526",
    },
  });
  initialized = true;
}

// Mermaid's <svg> ships as width="100%" with an inline `max-width` capped to
// its own natural size — meaningless once svg-pan-zoom takes over sizing.
// Strip both so the SVG fills whatever box CSS gives it.
function stripSizeConstraints(svgMarkup) {
  return svgMarkup.replace(/^(<svg\b[^>]*)>/, (_full, openTag) => {
    let tag = openTag.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    if (/style="[^"]*"/.test(tag)) {
      tag = tag.replace(
        /style="([^"]*)"/,
        (_m, style) => `style="${style.replace(/max-width:[^;]*;?/i, "").trim()}"`,
      );
    }
    return `${tag} width="100%" height="100%">`;
  });
}
</script>

<script setup>
import { ref, useId, watch, onBeforeUnmount } from "vue";
import svgPanZoom from "svg-pan-zoom";
import Icon from "./Icon.vue";

const props = defineProps({
  source: { type: String, required: true },
});

ensureInit();
const renderId = useId().replace(/:/g, "");

const svg = ref(null);
const error = ref(null);
const zoom = ref(1);
const containerRef = ref(null);
let panZoomInstance = null;

// Render the mermaid source into SVG. Re-runs whenever `source` changes.
watch(
  () => props.source,
  (_val, _old, onCleanup) => {
    let cancelled = false;
    svg.value = null;
    error.value = null;
    mermaid
      .render(`mmd-${renderId}`, props.source)
      .then(({ svg: rendered }) => {
        if (!cancelled) svg.value = stripSizeConstraints(rendered);
      })
      .catch((err) => {
        if (!cancelled) error.value = err instanceof Error ? err.message : "Falha ao renderizar diagrama.";
      });
    onCleanup(() => {
      cancelled = true;
    });
  },
  { immediate: true },
);

// Hand pan/zoom off to svg-pan-zoom (the same engine behind Mermaid's own
// Live Editor) instead of hand-rolling it: real drag-to-pan, wheel/pinch
// zoom, and a sane auto-fit — this is what caught the sizing bugs we used
// to patch around manually. `flush: "post"` waits for the v-html DOM update
// so the freshly inserted <svg> is queryable.
watch(
  svg,
  (val, _old, onCleanup) => {
    if (!val || !containerRef.value) return;
    const svgEl = containerRef.value.querySelector("svg");
    if (!svgEl) return;

    const instance = svgPanZoom(svgEl, {
      controlIconsEnabled: false,
      fit: true,
      center: true,
      minZoom: 0.5,
      maxZoom: 8,
      zoomScaleSensitivity: 0.3,
      dblClickZoomEnabled: true,
      mouseWheelZoomEnabled: true,
      preventMouseEventsDefault: true,
      onZoom: (newZoom) => {
        zoom.value = newZoom;
      },
    });
    panZoomInstance = instance;
    zoom.value = instance.getZoom();

    onCleanup(() => {
      instance.destroy();
      panZoomInstance = null;
    });
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  if (panZoomInstance) {
    panZoomInstance.destroy();
    panZoomInstance = null;
  }
});

function zoomOut() {
  panZoomInstance?.zoomOut();
}

function zoomIn() {
  panZoomInstance?.zoomIn();
}

function reset() {
  const instance = panZoomInstance;
  if (!instance) return;
  instance.reset();
  zoom.value = instance.getZoom();
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-1 self-end">
      <button
        type="button"
        @click="zoomOut"
        aria-label="Diminuir zoom"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-2 hover:text-ink"
      >
        <Icon name="minus" class="h-3.5 w-3.5" />
      </button>
      <span class="w-12 text-center text-xs font-medium text-ink-muted">{{ Math.round(zoom * 100) }}%</span>
      <button
        type="button"
        @click="zoomIn"
        aria-label="Aumentar zoom"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-2 hover:text-ink"
      >
        <Icon name="plus" class="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        @click="reset"
        class="rounded-lg px-2 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-2 hover:text-ink"
      >
        Reset
      </button>
    </div>

    <div
      ref="containerRef"
      class="relative touch-none overflow-hidden rounded-xl bg-canvas p-2"
      :style="{ height: '440px' }"
    >
      <p v-if="error" role="alert" class="flex items-center gap-1.5 p-4 text-sm text-primary-text">
        <Icon name="alert" class="h-4 w-4" /> {{ error }}
      </p>
      <p v-if="!svg && !error" class="p-4 text-sm text-ink-muted">Renderizando diagrama…</p>
      <div v-if="svg" class="h-full w-full" v-html="svg" />
    </div>
    <p v-if="svg && !error" class="text-xs text-ink-muted">
      Arraste para navegar · scroll para zoom (desktop) · toque duplo para ampliar
    </p>
  </div>
</template>
