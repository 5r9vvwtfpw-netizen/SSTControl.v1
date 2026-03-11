const MAX_CONCURRENT_PDFS = 4;
let activePdfs = 0;
const queue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  return new Promise((resolve) => {
    if (activePdfs < MAX_CONCURRENT_PDFS) {
      activePdfs++;
      resolve();
    } else {
      queue.push(() => {
        activePdfs++;
        resolve();
      });
    }
  });
}

function releaseSlot(): void {
  activePdfs--;
  if (queue.length > 0) {
    const next = queue.shift();
    if (next) next();
  }
}

export async function withPdfSemaphore<T>(fn: () => Promise<T>): Promise<T> {
  await acquireSlot();
  try {
    return await fn();
  } finally {
    releaseSlot();
  }
}

export function getPdfSemaphoreStats() {
  return { active: activePdfs, queued: queue.length, max: MAX_CONCURRENT_PDFS };
}
