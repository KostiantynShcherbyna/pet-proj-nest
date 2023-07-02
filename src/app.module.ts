import dotenv from 'dotenv'
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

dotenv.config()

const mongooseURI = process.env.MONGOOSE_URL || 'mongodb://0.0.0.0:27017'

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
