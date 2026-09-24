import { Test, TestingModule } from '@nestjs/testing';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AppConfigService } from './common/config/app-config.service';

describe('ApiGatewayController', () => {
  let apiGatewayController: ApiGatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [ApiGatewayService, AppConfigService],
    }).compile();

    apiGatewayController = app.get<ApiGatewayController>(ApiGatewayController);
  });

  describe('root', () => {
    it('should return platform health payload', () => {
      expect(apiGatewayController.getHealth()).toEqual({
        status: 'ok',
        service: 'api-gateway',
        environment: expect.any(String),
        timestamp: expect.any(String),
      });
    });
  });
});
