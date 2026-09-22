/** Fehler einer API-Anfrage mit HTTP-Status (z. B. 409, wenn ein anderer Tab neuer gespeichert hat). */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
