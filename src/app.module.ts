import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { CqrsModule } from "@nestjs/cqrs"
import { JwtService } from "@nestjs/jwt"
import { MongooseModule } from "@nestjs/mongoose"
import { PassportModule } from "@nestjs/passport"
import { ThrottlerModule } from "@nestjs/throttler"
import { AppService } from "./app.service"
import { throttler } from "./infrastructure/guards/throttler.guard"
import { configuration } from "./infrastructure/settings/configuration"
import { TestingController } from "./infrastructure/testing/api/testing.controller"
import { TokensService } from "./infrastructure/services/tokens.service"
import { EmailAdapter } from "./infrastructure/adapters/email.adapter"
import { TypeOrmModule } from "@nestjs/typeorm"
import { LoginLocalStrategySql } from "./infrastructure/strategy/login-local-strategy.sql"
import { BlogIdIsExistSql } from "./infrastructure/decorators/blogId.decorator.sql"
import { typeormConfig } from "./db/typeorm/typeorm.config"
import { typeOrmControllers, typeOrmProviders } from "./db/typeorm/typeorm.service"
import { mongooseConfig } from "./db/mongoose/mongoose.config"
import { FilesStorageAdapter } from "./infrastructure/adapters/files-storage.adapter"
import { FilesS3StorageAdapter } from "./infrastructure/adapters/files-s3-storage.adapter"
import { BlogWallpaperDecorator } from "./infrastructure/decorators/blog-wallpaper.decorator"


const services = [
  AppService,
  TokensService,
  throttler,
  JwtService,
  // LoginLocalStrategy,
  LoginLocalStrategySql,
  // BlogIdIsExist,
  BlogIdIsExistSql,
  EmailAdapter,
  FilesStorageAdapter,
  FilesS3StorageAdapter,
  BlogWallpaperDecorator,
]

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env", load: [configuration] }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeormConfig),
    // MongooseModule.forRoot(mongooseConfig.connection),
    // MongooseModule.forFeature(mongooseConfig.features),
    ThrottlerModule.forRoot(),
    PassportModule,
    CqrsModule,
    // JwtModule.register({
    //   secret: Secrets.ACCESS_JWT_SECRET,
    //   signOptions: { expiresIn: '60s' },
    // }),
  ],
  controllers: [
    // ...mongooseControllers,
    ...typeOrmControllers,
    TestingController,
  ],
  providers: [
    // ...mongooseProviders,
    ...typeOrmProviders,
    ...services,
  ],
})
export class AppModule {
}
