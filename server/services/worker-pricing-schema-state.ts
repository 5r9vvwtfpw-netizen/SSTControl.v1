let workerPricingSchemaReady = false;

export class WorkerPricingSchemaUnavailableError extends Error {
  constructor(message = "La configuración de tarifas no está disponible por mantenimiento de base de datos.") {
    super(message);
    this.name = "WorkerPricingSchemaUnavailableError";
  }
}

export function markWorkerPricingSchemaReady(): void {
  workerPricingSchemaReady = true;
}

export function markWorkerPricingSchemaUnavailable(_error: unknown): void {
  workerPricingSchemaReady = false;
}

export function isWorkerPricingSchemaReady(): boolean {
  return workerPricingSchemaReady;
}

export function assertWorkerPricingSchemaReady(): void {
  if (!workerPricingSchemaReady) {
    throw new WorkerPricingSchemaUnavailableError(
      "El módulo de tarifas está temporalmente indisponible. No se inició ningún cobro.",
    );
  }
}