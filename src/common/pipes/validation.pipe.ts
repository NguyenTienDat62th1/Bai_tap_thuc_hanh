import * as common from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export interface ValidationError {
  property: string;
  constraints: { [key: string]: string };
  children?: ValidationError[];
}

@common.Injectable()
export class AppValidationPipe extends common.ValidationPipe {
  constructor(options?: common.ValidationPipeOptions) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        return new common.BadRequestException(this.formatErrors(errors));
      },
      ...options,
    });
  }

  private formatErrors(errors: any[]): { statusCode: number; message: string; errors: any } {
    const formatError = (error: any): ValidationError => {
      const result: ValidationError = {
        property: error.property,
        constraints: error.constraints || {},
      };

      if (error.children && error.children.length > 0) {
        result.children = error.children.map((child: any) => formatError(child));
      }

      return result;
    };

    return {
      statusCode: 400,
      message: 'Validation failed',
      errors: errors.map((error) => formatError(error)),
    };
  }

  public async transform(value: any, metadata: common.ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metadata)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, this.validatorOptions);

    if (errors.length > 0) {
      throw this.exceptionFactory(errors);
    }

    // Handle custom validation
    if (object && typeof object['validate'] === 'function') {
      const customValidationResult = object['validate'](object);
      if (customValidationResult === false) {
        throw this.exceptionFactory([
          {
            property: object.constructor.name,
            constraints: { customValidation: 'Custom validation failed' },
          },
        ]);
      }
    }

    return object;
  }
}
