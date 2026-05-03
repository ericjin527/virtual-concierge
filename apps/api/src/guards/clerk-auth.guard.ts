import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = (req.headers['authorization'] as string)?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing auth token');

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.error('[ClerkAuthGuard] CLERK_SECRET_KEY is not set');
      throw new UnauthorizedException('Server misconfiguration: missing CLERK_SECRET_KEY');
    }

    try {
      const payload = await verifyToken(token, { secretKey });
      req.clerkUserId = payload.sub;
      return true;
    } catch (err) {
      console.error('[ClerkAuthGuard] Token verification failed:', err);
      throw new UnauthorizedException('Invalid auth token');
    }
  }
}
