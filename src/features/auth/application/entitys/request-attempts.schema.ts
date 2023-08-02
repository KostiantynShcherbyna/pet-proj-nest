import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";


@Schema()
export class RequestAttempts {
  @Prop({
    type: String,
    required: true
  })
  IP: string;

  @Prop({
    type: String,
    required: true
  })
  URL: string;

  @Prop({
    type: Date,
    required: true
  })
  date: Date;
}
export const RequestAttemptsSchema = SchemaFactory.createForClass(RequestAttempts);

export type RequestAttemptsDocument = HydratedDocument<RequestAttempts>;
export type RequestAttemptsModel = Model<RequestAttemptsDocument>

