import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SumUpBaseService {
  constructor(private readonly httpService: HttpService) {}

  async get({ config, path }: { path: string; config?: AxiosRequestConfig<any> }) {
    return firstValueFrom(this.httpService.get(`/${path}`, config));
  }

  async patch({ config, path, data }: { path: string; config?: AxiosRequestConfig<any>; data?: any }) {
    return firstValueFrom(this.httpService.patch(`/${path}`, data, config));
  }

  async post({ config, path, data }: { path: string; config?: AxiosRequestConfig<any>; data?: any }) {
    return firstValueFrom(this.httpService.post(`/${path}`, data, config));
  }

  async put({ config, path, data }: { path: string; config?: AxiosRequestConfig<any>; data?: any }) {
    return firstValueFrom(this.httpService.put(`/${path}`, data, config));
  }

  async delete({ config, path }: { path: string; config?: AxiosRequestConfig<any> }) {
    return firstValueFrom(this.httpService.delete(`/${path}`, config));
  }

  async head({ config, path }: { path: string; config?: AxiosRequestConfig<any> }) {
    return firstValueFrom(this.httpService.head(`/${path}`, config));
  }
}
