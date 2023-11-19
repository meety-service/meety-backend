class ErrorCodeVo {
    readonly status;
    readonly message;
  
    constructor(status, message) {
      this.status = status;
      this.message = message;
    }
}
  
export type ErrorCode = ErrorCodeVo;

//에러메세지 별도 설정 없을시 들어가는 default 메세지
export const ENTITY_NOT_FOUND = new ErrorCodeVo(404, '요청된 리소스중 존재하지 않는 리소스가 존재합니다.');
export const ENTITY_DUPLICATED = new ErrorCodeVo(404, '요청된 리소스가 이미 존재합니다.');
export const INVALID_REQUEST = new ErrorCodeVo(404, '적절한 요청값이 아닙니다.');