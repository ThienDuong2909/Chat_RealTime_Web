class ApiResponse {
  constructor(res) {
    this.res = res;
    this.response = {
      status: null,
      message: null,
      data: null,
    };
  }

  setStatus(statusCode) {
    this.response.status = statusCode;
    return this;
  }

  setMessage(message) {
    this.response.message = message;
    return this;
  }

  setData(data) {
    this.response.data = data;
    return this;
  }

  send() {
    const { status, message, data } = this.response;
    if (!status) {
      throw new Error("Status code is required");
    }

    const responsePayload = {};
    if (message) responsePayload.message = message;
    if (data) responsePayload.data = data;

    return this.res.status(status).json(responsePayload);
  }
}

export default ApiResponse;
