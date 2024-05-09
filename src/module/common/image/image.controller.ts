import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadImageDto } from './dto/image.dto';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';
import { Auth } from 'src/module/public/auth/decorator/auth.decorator';

@ApiTags('Upload Image')
@Controller('images')
export class ImageController {
  @Post()
  @Auth()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        folder: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const body = req.body;

          let path = './uploads';

          if (body.folder) {
            path += `/${body.folder}/`;
          }

          fs.access(path, (error) => {
            if (error) {
              if (error.code === 'ENOENT') {
                fs.mkdirSync(path);

                cb(null, path);
              }
            } else {
              cb(null, path);
            }
          });
        },
        filename: (req, file, cb) => {
          cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        },
      }),
    }),
  )
  async upload(
    @Body() body: UploadImageDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    image: Express.Multer.File,
    @Req() req: Request,
  ) {
    return { path: image.path, url: req.protocol + '://' + req.get('Host') + '/' + image.path };
  }
}
