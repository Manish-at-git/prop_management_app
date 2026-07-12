import { Controller, Get, Post, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CodeRequestsService } from './code-requests.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, CodeRequestStatus } from '@prisma/client';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Code Requests')
// @ApiBearerAuth()
// @Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('code-requests')
export class CodeRequestsController {
  constructor(private readonly codeRequestsService: CodeRequestsService) { }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List and filter registration code requests (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Return list of code requests' })
  findAll(
    @Query('associationId') associationId?: string,
    @Query('status') status?: CodeRequestStatus,
  ) {
    return this.codeRequestsService.findAll(associationId, status);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get code request details by ID (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Return code request details' })
  @ApiResponse({ status: 404, description: 'Code request not found' })
  findOne(@Param('id') id: string) {
    return this.codeRequestsService.findOne(id);
  }

  @Public()
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve code request and generate access code (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Code request approved, returns generated access code' })
  @ApiResponse({ status: 400, description: 'Cannot approve already processed request' })
  @ApiResponse({ status: 404, description: 'Code request not found' })
  approve(@Param('id') id: string) {
    return this.codeRequestsService.approve(id);
  }

  @Public()
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject code request (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Code request successfully rejected' })
  @ApiResponse({ status: 400, description: 'Cannot reject already processed request' })
  @ApiResponse({ status: 404, description: 'Code request not found' })
  reject(@Param('id') id: string) {
    return this.codeRequestsService.reject(id);
  }
}
