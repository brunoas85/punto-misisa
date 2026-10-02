/** Error con status HTTP; el manejador central lo devuelve como `{ error }`. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
