import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BLOGS_DESCRIPTION_MAX_LENGTH, BLOGS_NAME_MAX_LENGTH, BLOGS_WEBSITEURL_MAX_LENGTH, BLOGS_WEBSITEURL_REGEX } from 'src/utils/constants/constants';

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