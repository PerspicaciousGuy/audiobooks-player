"use client";

import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaManager() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent>();
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker>();

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (registration.waiting) setWaitingWorker(registration.waiting);
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(worker);
            }
          });
        });
      })
      .catch(() => undefined);

    return () =>
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  if (!installPrompt && !waitingWorker) return null;

  return (
    <aside className="border-border bg-paper-elevated shadow-card rounded-card fixed top-4 right-4 z-50 flex max-w-sm items-center gap-3 border p-4 text-sm">
      <p className="flex-1">
        {waitingWorker
          ? "A Quiet Library update is ready."
          : "Install Quiet Library for a focused app experience."}
      </p>
      <button
        className="bg-ink text-paper-elevated rounded-control min-h-11 px-4 font-semibold"
        onClick={() => {
          if (waitingWorker) {
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              () => window.location.reload(),
              { once: true },
            );
            waitingWorker.postMessage("SKIP_WAITING");
          } else if (installPrompt) {
            void installPrompt.prompt().then(() => setInstallPrompt(undefined));
          }
        }}
        type="button"
      >
        {waitingWorker ? "Update" : "Install"}
      </button>
    </aside>
  );
}
