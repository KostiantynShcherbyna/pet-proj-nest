import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AttemptRequestsDocument = HydratedDocument<AttemptRequests>;

@Schema()
export class AttemptRequests {
    @Prop({
        type: String,
        required: true,
    })
    IP: string

    @Prop({
        type: String,
        required: true,
    })
    URL: string

    @Prop({
        type: Date,
        required: true,
    })
    date: Date
}

export const AttemptRequestsSchema = SchemaFactory.createForClass(AttemptRequests);