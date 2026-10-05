import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// The app uses Vite's JSX runtime; tsx runs JSX-preserving source with React in scope.
(globalThis as typeof globalThis & { React: typeof React }).React = React;
const { SubscriptionBlockedModal } = await import("../client/src/components/SubscriptionBlockedModal");

for (const subscriptionStatus of ["past_due", "trial_expired", "cancelled", "no_subscription", "blocked"]) {
  test(`${subscriptionStatus}: activation and help without payment links`, () => {
    const html = renderToStaticMarkup(React.createElement(SubscriptionBlockedModal, {
      subscriptionStatus,
      blockedReason: "Por favor active su suscripción.",
      onActivateSubscription: () => {},
    }));
    assert.match(html, /Activar Suscripción/);
    assert.match(html, /soporte@sst-colombia\.com/);
    assert.equal((html.match(/<button\b/g) || []).length, 1);
    assert.doesNotMatch(html, /enlace|correo de contacto|Enviando/i);
  });
}

test("induction approval keeps its distinct email action", () => {
  const html = renderToStaticMarkup(React.createElement(SubscriptionBlockedModal, {
    subscriptionStatus: "blocked",
    blockedReason: "Solicite capacitación a admin@sst-colombia.com",
    onActivateSubscription: () => {},
  }));
  assert.match(html, /Solicitar capacitación por correo/);
  assert.match(html, /mailto:admin@sst-colombia\.com/);
  assert.doesNotMatch(html, /enlace|Activar Suscripción/i);
});
