import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';


export type DevicesDocument = HydratedDocument<Devices>;

@Schema()
export class Devices {
    @Prop({
        type: String,
        required: true,
    })
    ip: string

    @Prop({
        type: String,
        required: true,
    })
    title: string

    @Prop({
        type: String,
        required: true,
    })
    lastActiveDate: string

    @Prop({
        type: String,
        required: true,
    })
    deviceId: string

    @Prop({
        type: String,
        required: true,
    })
    userId: string

    @Prop({
        type: Date,
        required: true,
    })
    expireAt: string

}

export const DevicesSchema = SchemaFactory.createForClass(Devices);