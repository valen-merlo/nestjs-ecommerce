import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/api/auth/guards/auth.decorator';
import { CurrentUser } from 'src/api/auth/guards/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Get('profile')
  async profile(@CurrentUser() user: User) {
    const full = await this.userService.findById(user.id, { roles: true });
    return {
      id: full.id,
      email: full.email,
      roleIds: full.roles?.map((r) => r.id) ?? [],
    };
  }
}
