import { Controller, Get, Post, Body, Patch, Param, Query, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenancePriority, MaintenanceStatus } from '@prisma/client';

@ApiTags('Maintenance Requests')
@ApiBearerAuth()
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a maintenance request (Any authenticated user)' })
  @ApiResponse({ status: 201, description: 'Maintenance request submitted successfully' })
  create(@Body() createMaintenanceDto: CreateMaintenanceDto, @Request() req) {
    return this.maintenanceService.create(req.user.id, createMaintenanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List maintenance requests' })
  @ApiResponse({ status: 200, description: 'Return list of maintenance requests' })
  findAll(
    @Request() req,
    @Query('status') status?: MaintenanceStatus,
    @Query('priority') priority?: MaintenancePriority,
  ) {
    return this.maintenanceService.findAll(req.user, status, priority);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get maintenance request details by ID' })
  @ApiResponse({ status: 200, description: 'Return maintenance request details' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.maintenanceService.findOne(id, req.user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update maintenance request (Admin/Manager can change status/priority; Resident can edit details)' })
  @ApiResponse({ status: 200, description: 'Maintenance request successfully updated' })
  @ApiResponse({ status: 400, description: 'Cannot update closed request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  update(@Param('id') id: string, @Body() updateMaintenanceDto: UpdateMaintenanceDto, @Request() req) {
    return this.maintenanceService.update(id, updateMaintenanceDto, req.user);
  }
}
