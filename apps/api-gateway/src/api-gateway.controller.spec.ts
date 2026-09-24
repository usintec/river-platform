import { Test, TestingModule } from '@nestjs/testing';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';

describe('ApiGatewayController', () => {
  let controller: ApiGatewayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiGatewayController],
      providers: [ApiGatewayService],
    }).compile();

    controller = module.get<ApiGatewayController>(ApiGatewayController);
  });

  it('should return health payload', () => {
    expect(controller.getHealth()).toMatchObject({
      status: 'ok',
      service: 'api-gateway',
    });
  });
});
