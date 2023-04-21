export function createFigmaError(message: string, timeShow: number, bool: boolean) {
  figma.notify(message, { timeout: timeShow, error: bool });
}
