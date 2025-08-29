import { Prop } from '@nestjs/mongoose';

export class BaseSchema {
  @Prop({ default: false })
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
