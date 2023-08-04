import { HttpStatus, INestApplication } from "@nestjs/common"
import { Test } from '@nestjs/testing';


import request from "supertest"
import { AppModule } from "../src/app.module"
import { appSettings } from "../src/app.settings"

describe('App', () => {
    let app: INestApplication;
    let httpServer: any

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();

        appSettings(app)
        httpServer = app.getHttpServer()
        await app.init();


    });

    it(`+ Registration User`, async () => {

        const regData = {
            "login": "kstntn",
            "password": "password",
            "email": "kstntn.xxx@gmail.com"
        }

        await request(httpServer)
          .post(`/registration`)
          .send(regData)
          .expect(HttpStatus.CREATED)
    })
    afterAll(async () => {
        await app.close();
    });
});