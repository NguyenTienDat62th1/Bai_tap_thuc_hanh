import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import type { CreateUserDto, JwtPayload, UserProfile } from '../interfaces/user.interface';

@ApiTags('user')
@Controller('user')
export class UserController {
    @Get()
    getAllUsers() {
        return [
        { id: 1, name: 'Nguyen Van A' },
        { id: 2, name: 'Tran Thi B' },
        ];
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    getProfile(@CurrentUser() user: UserProfile) {
        return { message: 'This is your profile', user };
    }
    
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiBody({
        schema: { type: 'object', properties: { name: { type: 'string' } } },
    })
    createUser(@Body() body: CreateUserDto, @CurrentUser() user: UserProfile) {
        return { message: `User ${body.name} created successfully by ${user.username}!` };
    }
}
