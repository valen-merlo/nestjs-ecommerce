import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => ({
        isSuccess: true,
        message: 'success',
        data,
        errorCode: null,
        errors: [],
      })),
    );
  }
}

export const successObject = {
  message: 'success',
};
