class ErrorCodeVo {
  readonly status;
  readonly title;
  readonly message;

  constructor(status, title, message) {
    this.status = status;
    this.title = title;
    this.message = message;
  }
}

export type ErrorCode = ErrorCodeVo;

//에러메세지 별도 설정 없을시 들어가는 default 메세지
export const ENTITY_NOT_FOUND = new ErrorCodeVo(404,  '리소스를 찾을 수 없습니다.', '요청된 리소스중 존재하지 않는 리소스가 존재합니다.');
export const ENTITY_DUPLICATED = new ErrorCodeVo(404, '중복된 리소스입니다.', '요청된 리소스가 이미 존재합니다.');
export const INVALID_REQUEST = new ErrorCodeVo(404, '요청 값이 유효하지 않습니다.', '적절한 요청값이 아닙니다.');
export const NO_RIGHT = new ErrorCodeVo(404, '수행 권한이 없습니다.', '권한을 확인해주세요.');