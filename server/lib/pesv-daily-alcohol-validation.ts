export type DailyAlcoholSubmission = {
  consumoAlcohol: unknown;
  declaracionNoAlcoholConfirmada?: unknown;
  resultadoAlcoholimetria?: unknown;
};

export function validateDailyAlcoholSubmission(
  submission: DailyAlcoholSubmission,
  dailyAlcoholTestingEnabled: boolean,
) {
  const consumoAlcohol = Number(submission.consumoAlcohol);
  if (consumoAlcohol !== 0 && consumoAlcohol !== 1) {
    throw new Error("Debe responder si consumió alcohol en las últimas 12 horas");
  }
  if (consumoAlcohol === 0 && Number(submission.declaracionNoAlcoholConfirmada) !== 1) {
    throw new Error("Debe confirmar la declaración de no consumo de alcohol");
  }

  const resultadoAlcoholimetria = typeof submission.resultadoAlcoholimetria === "string"
    ? submission.resultadoAlcoholimetria.trim().replace(",", ".")
    : "";
  if (
    dailyAlcoholTestingEnabled &&
    (!resultadoAlcoholimetria || !/^\d+(\.\d+)?$/.test(resultadoAlcoholimetria))
  ) {
    throw new Error("Debe registrar un resultado de alcoholimetría válido");
  }

  return {
    consumoAlcohol,
    resultadoAlcoholimetria: dailyAlcoholTestingEnabled ? resultadoAlcoholimetria : null,
    declaracionNoAlcoholConfirmada: consumoAlcohol === 0 ? 1 : 0,
    declaracionNoAlcoholConfirmadaAt: consumoAlcohol === 0 ? new Date() : null,
  };
}