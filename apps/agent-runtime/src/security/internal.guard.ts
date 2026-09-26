import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(c: ExecutionContext) {
    const r = c.switchToHttp().getRequest();
    const s = process.env.INTERNAL_SERVICE_SECRET;
    if (!s || r.headers["x-internal-service-secret"] !== s)
      throw new UnauthorizedException("Invalid internal service identity");
    return true;
  }
}
