import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";
import svgPanZoom from "svg-pan-zoom";
import { Icon } from "./Icon";

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
function stripSizeConstraints(svgMarkup: string): string {
  return svgMarkup.replace(/^(<svg\b[^>]*)>/, (_full, openTag: string) => {
    let tag = openTag.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
    if (/style="[^"]*"/.test(tag)) {
      tag = tag.replace(
        /style="([^"]*)"/,
        (_m, style: string) => `style="${style.replace(/max-width:[^;]*;?/i, "").trim()}"`,
      );
    }
    return `${tag} width="100%" height="100%">`;
  });
}

export function MermaidDiagram({ source }: { source: string }) {
  ensureInit();
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const panZoomRef = useRef<ReturnType<typeof svgPanZoom> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(null);
    mermaid
      .render(`mmd-${reactId}`, source)
      .then(({ svg }) => {
        if (!cancelled) setSvg(stripSizeConstraints(svg));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao renderizar diagrama.");
      });
    return () => {
      cancelled = true;
    };
  }, [source, reactId]);

  // Hand pan/zoom off to svg-pan-zoom (the same engine behind Mermaid's own
  // Live Editor) instead of hand-rolling it: real drag-to-pan, wheel/pinch
  // zoom, and a sane auto-fit — this is what caught the sizing bugs we used
  // to patch around manually.
  useEffect(() => {
    if (!svg || !containerRef.current) return;
    const svgEl = containerRef.current.querySelector("svg");
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
      onZoom: (newZoom) => setZoom(newZoom),
    });
    panZoomRef.current = instance;
    setZoom(instance.getZoom());

    return () => {
      instance.destroy();
      panZoomRef.current = null;
    };
  }, [svg]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1 self-end">
        <button
          type="button"
          onClick={() => panZoomRef.current?.zoomOut()}
          aria-label="Diminuir zoom"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <Icon name="minus" className="h-3.5 w-3.5" />
        </button>
        <span className="w-12 text-center text-xs font-medium text-ink-muted">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => panZoomRef.current?.zoomIn()}
          aria-label="Aumentar zoom"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <Icon name="plus" className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            const instance = panZoomRef.current;
            if (!instance) return;
            instance.reset();
            setZoom(instance.getZoom());
          }}
          className="rounded-lg px-2 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          Reset
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative touch-none overflow-hidden rounded-xl bg-canvas p-2"
        style={{ height: 440 }}
      >
        {error && (
          <p role="alert" className="flex items-center gap-1.5 p-4 text-sm text-primary-text">
            <Icon name="alert" className="h-4 w-4" /> {error}
          </p>
        )}
        {!svg && !error && <p className="p-4 text-sm text-ink-muted">Renderizando diagrama…</p>}
        {svg && <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: svg }} />}
      </div>
      {svg && !error && (
        <p className="text-xs text-ink-muted">Arraste para navegar · scroll para zoom (desktop) · toque duplo para ampliar</p>
      )}
    </div>
  );
}
