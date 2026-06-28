/** Cola de impresión: un ticket a la vez (evita diálogos superpuestos). */

type PrintJob = () => void;

type EnqueueOpts = {
  /** RawBT y similares no disparan afterprint — no esperar. */
  skipWait?: boolean;
};

let queue: Array<{ job: PrintJob; skipWait: boolean }> = [];
let draining = false;

function waitForPrintDone(): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener("afterprint", done);
      resolve();
    };
    window.addEventListener("afterprint", done);
    window.setTimeout(done, 4000);
  });
}

async function drain(): Promise<void> {
  if (draining) return;
  draining = true;
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) continue;
    item.job();
    if (!item.skipWait) {
      await waitForPrintDone();
    } else {
      await new Promise((r) => window.setTimeout(r, 800));
    }
    await new Promise((r) => window.setTimeout(r, 300));
  }
  draining = false;
}

export function enqueuePrint(job: PrintJob, opts?: EnqueueOpts): void {
  queue.push({ job, skipWait: Boolean(opts?.skipWait) });
  void drain();
}
