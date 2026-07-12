import { Controller, Get, Post, Body, Patch, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CorrectionRequestsService } from './correction-requests.service';
import { CreateCorrectionRequestDto } from './dto/create-correction-request.dto';
import { UpdateCorrectionStatusDto } from './dto/update-correction-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, CorrectionRequestStatus } from '@prisma/client';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Correction Requests')
// @ApiBearerAuth()
@Controller('correction-requests')
export class CorrectionRequestsController {
  constructor(private readonly correctionRequestsService: CorrectionRequestsService) { }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a profile correction request (Resident only)' })
  @ApiResponse({ status: 201, description: 'Correction request submitted successfully' })
  create(@Body() createCorrectionRequestDto: CreateCorrectionRequestDto, @Request() req) {
    return this.correctionRequestsService.create(req.user.id, createCorrectionRequestDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List profile correction requests' })
  @ApiResponse({ status: 200, description: 'Return list of correction requests' })
  findAll(@Request() req, @Query('status') status?: CorrectionRequestStatus) {
    return this.correctionRequestsService.findAll(req.user, status);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get correction request details by ID' })
  @ApiResponse({ status: 200, description: 'Return correction request details' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Correction request not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.correctionRequestsService.findOne(id, req.user);
  }

  @Public()
  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update correction request status (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Correction request status successfully updated' })
  @ApiResponse({ status: 400, description: 'Request already resolved or rejected' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Correction request not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateCorrectionStatusDto: UpdateCorrectionStatusDto,
    @Request() req,
  ) {
    return this.correctionRequestsService.updateStatus(id, updateCorrectionStatusDto, req.user);
  }
}
