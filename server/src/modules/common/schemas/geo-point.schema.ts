import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point', required: true })
  type!: 'Point';

  // [lng, lat]
  @Prop({ type: [Number], required: true })
  coordinates!: [number, number];
}
export const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);
