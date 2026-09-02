declare module "canvas-confetti" {
  type ConfettiOptions = Record<string, unknown>;

  const confetti: (options?: ConfettiOptions) => Promise<unknown>;

  export default confetti;
}