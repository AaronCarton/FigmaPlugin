export function createFigmaError(message: string, timeShown: number, bool: boolean) {
  figma.notify(message, { timeout: timeShown, error: bool });
}
