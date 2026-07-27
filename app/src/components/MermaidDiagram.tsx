import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";
import { Icon } from "./Icon";

let initialized = false;

function ensureInit() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "strict",
    fontFamily: '"Segoe UI", Roboto, system-ui, sans-serif',
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

export function MermaidDiagram({ source, title }: { source: string; title: string }) {
  ensureInit();
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(null);
    setZoom(1);
    mermaid
      .render(`mmd-${reactId}`, source)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao renderizar diagrama.");
      });
    return () => {
      cancelled = true;
    };
  }, [source, reactId]);

  function handleDownload() {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-line bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
            aria-label="Diminuir zoom"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface hover:text-ink"
          >
            <Icon name="minus" className="h-3.5 w-3.5" />
          </button>
          <span className="w-12 text-center text-xs font-medium text-ink-muted">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            aria-label="Aumentar zoom"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface hover:text-ink"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface hover:text-ink"
          >
            Reset
          </button>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!svg}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink disabled:opacity-40"
        >
          <Icon name="download" className="h-3.5 w-3.5" /> Baixar SVG
        </button>
      </div>

      <div
        className="overflow-auto rounded-xl border border-line-soft bg-canvas p-6"
        style={{ minHeight: 240 }}
      >
        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-sm text-primary-text">
            <Icon name="alert" className="h-4 w-4" /> {error}
          </p>
        )}
        {!svg && !error && <p className="text-sm text-ink-faint">Renderizando diagrama…</p>}
        {svg && (
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: "max-content" }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
}
