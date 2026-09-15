import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  usuarioId: bigint;
  email: string;
}

/**
 * Extrae el usuario autenticado (payload del JWT) del request.
 * Uso: metodo(@CurrentUser() user: JwtUser)
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtUser;
    return data ? user?.[data] : user;
  },
);
