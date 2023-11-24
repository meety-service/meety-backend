// ENTITY_NOT_FOUND 값 객체(status, default-message)를 가진

import {
  ENTITY_DUPLICATED,
  ENTITY_NOT_FOUND,
  ErrorCode,
  INVALID_REQUEST,
} from './error-code';

//  ServiceException 인스턴스 생성 메서드
export const EntityNotFoundException = (message?: string): ServiceException => {
  return new ServiceException(ENTITY_NOT_FOUND, message);
};

export const EntityDuplicatedException = (
  message?: string,
): ServiceException => {
  return new ServiceException(ENTITY_DUPLICATED, message);
};

export const InvalidRequestException = (message?: string): ServiceException => {
  return new ServiceException(INVALID_REQUEST, message);
};

export const NoRightException = (message?: string): ServiceException => {
  return new ServiceException(INVALID_REQUEST, message);
};

export class ServiceException extends Error {
  readonly errorCode: ErrorCode;
  readonly title: String;

  constructor(errorCode: ErrorCode, title?: string, message?: string) {
    if (!title) {
      title = errorCode.title;
    }
    if (!message) {
      message = errorCode.message;
    }

    super(message);

    this.errorCode = errorCode;
    this.title = title;
  }
}
