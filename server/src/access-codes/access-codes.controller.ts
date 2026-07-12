import { Controller, Get, Post, Body, Param, Delete, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AccessCodesService } from './access-codes.service';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole, AccessCodeStatus } from '@prisma/client';

@ApiTags('Access Codes')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('access-codes')
export class AccessCodesController {
  constructor(private readonly accessCodesService: AccessCodesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate a new Access Code (Admin/Manager only)' })
  @ApiResponse({ status: 201, description: 'Access code generated successfully' })
  @ApiResponse({ status: 409, description: 'Code already exists' })
  create(@Body() createAccessCodeDto: CreateAccessCodeDto) {
    return this.accessCodesService.create(createAccessCodeDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List and filter access codes (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Return filtered list of access codes' })
  findAll(
    @Query('associationId') associationId?: string,
    @Query('status') status?: AccessCodeStatus,
  ) {
    return this.accessCodesService.findAll(associationId, status);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get access code details by ID (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Return access code details' })
  @ApiResponse({ status: 404, description: 'Access code not found' })
  findOne(@Param('id') id: string) {
    return this.accessCodesService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an access code (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Access code successfully revoked' })
  @ApiResponse({ status: 409, description: 'Cannot revoke already used code' })
  @ApiResponse({ status: 404, description: 'Access code not found' })
  revoke(@Param('id') id: string) {
    return this.accessCodesService.revoke(id);
  }
}
