export class NetworkError {
    constructor(code, message) {
        this._code = code;
        this._message = message;
    }
    get statusCode() {
        return this._code;
    }
    get message() {
        return this._message;
    }
}