export class ResponseDto<Data> {
  data: Data;

  constructor(data: Data) {
    this.data = data;
  }
}
