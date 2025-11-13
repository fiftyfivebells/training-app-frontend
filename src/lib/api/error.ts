import { components } from '../../generated/api/types'

type BadRequest = components['schemas']['BadRequest']
type NotFound = components['schemas']['NotFound']
type Unauthorized = components['schemas']['Unauthorized']
type Forbidden = components['schemas']['Forbidden']
type Conflict = components['schemas']['Conflict']
type ValidationError = components['schemas']['ValidationError']
type InternalServerError = components['schemas']['InternalServerError']
type ServiceUnavailable = components['schemas']['ServiceUnavailable']

type ApiErrorBody =
  | BadRequest
  | NotFound
  | Unauthorized
  | Forbidden
  | Conflict
  | ValidationError
  | InternalServerError
  | ServiceUnavailable

export class ApiError extends Error {
  private status: number
  private body: ApiErrorBody

  constructor(status: number, body: ApiErrorBody) {
    super(ApiError.extractMessage(status, body))
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }

  private static extractMessage(status: number, body: ApiErrorBody): string {
    if ('message' in body && body.message) {
      return body.message
    }

    // NotFound
    if ('resource' in body && 'id' in body) {
      return `${body.resource} with id ${body.id} not found`
    }

    // ValidationError
    if ('field' in body && 'issue' in body) {
      return `${body.field}: ${body.issue}`
    }

    // ServiceUnavailable
    if ('service' in body) {
      return `Service ${body.service} is unavailable`
    }

    return `Request failed with status ${status}`
  }

  // Convenience methods for specific error types
  get isValidationError(): boolean {
    return this.status === 422
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isConflict(): boolean {
    return this.status === 409
  }

  // Type guard for accessing specific error body shapes
  getValidationError(): ValidationError | null {
    if (this.isValidationError && 'field' in this.body) {
      return this.body as ValidationError
    }
    return null
  }

  getNotFoundDetails(): NotFound | null {
    if (this.isNotFound && 'resource' in this.body) {
      return this.body
    }
    return null
  }

  getBadRequestDetails(): BadRequest | null {
    if (this.status === 400 && 'message' in this.body) {
      return this.body as BadRequest
    }
    return null
  }
}
