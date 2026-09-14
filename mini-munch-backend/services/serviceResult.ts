// generic interface to represent the success result of a service function
export interface ServiceSuccess<T> {
  success: true;
  data: T;
}

// generic interface to represent the failure result of a service function
export interface ServiceFailure<E> {
  success: false;
  serviceError: E;
}

// generic type to represent the result of a service function, which can be either a success or a failure
export type ServiceResult<T, E> = ServiceSuccess<T> | ServiceFailure<E>;
