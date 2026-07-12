import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, ForbiddenException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Users')
// @ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Public()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return logged-in user details' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'List all users (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Return paginated users list' })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiResponse({ status: 200, description: 'Return user details' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(@Param('id') id: string, @Request() req) {
    // Standard users can only view their own details. Admin and Manager can view any details.
    if (req.user.role === UserRole.RESIDENT && req.user.id !== id) {
      throw new ForbiddenException('You do not have access to view this user');
    }
    return this.usersService.findOne(id);
  }

  @Public()
  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    if (req.user.role === UserRole.RESIDENT && req.user.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Public()
  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user status (Enable/Suspend)' })
  @ApiResponse({ status: 200, description: 'User status successfully updated' })
  updateStatus(@Param('id') id: string, @Body() updateUserStatusDto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, updateUserStatusDto);
  }

  @Public()
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
