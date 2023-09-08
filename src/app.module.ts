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
import { typeOrmConfig } from "./db/orm/type-orm.config"
import { typeOrmControllers, typeOrmProviders } from "./db/orm/type-orm.service"
import { mongooseConfig } from "./db/mongoose/mongoose.config"


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
]

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env", load: [configuration] }),
    TypeOrmModule.forRoot(typeOrmConfig),
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
