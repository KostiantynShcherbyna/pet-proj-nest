import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";


@Schema()
export class AttemptRequests {
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
export const AttemptRequestsSchema = SchemaFactory.createForClass(AttemptRequests);

export type AttemptRequestsDocument = HydratedDocument<AttemptRequests>;
export type AttemptRequestsModel = Model<AttemptRequestsDocument>

