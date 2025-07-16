export class ApiResponseDto<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: any;
}
