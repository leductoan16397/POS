import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { tap } from 'rxjs/operators';
export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const rs = context.switchToHttp().getResponse();

        return {
          statusCode: rs.statusCode,
          data,
        };
      }),
    );
  }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const rq = context.switchToHttp().getRequest();
    console.log(`...........Before....${rq.path}..`);
    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(`...............After......${rq.path}................................ ${Date.now() - now}ms`),
        ),
      );
  }
}
