import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = (req.headers['authorization'] as string)?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing auth token');

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      req.clerkUserId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid auth token');
    }
  }
}
