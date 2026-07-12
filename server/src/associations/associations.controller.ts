import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { AssociationQueryDto } from './dto/association-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Associations')
// @ApiBearerAuth()
@Controller('associations')
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) { }

  @Public()
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new association (Admin only)' })
  @ApiResponse({ status: 201, description: 'Association created' })
  create(@Body() createAssociationDto: CreateAssociationDto) {
    return this.associationsService.create(createAssociationDto);
  }

  @Public() // Public route for onboarding/registration search
  @Get()
  @ApiOperation({ summary: 'List all associations (Public for onboarding selection)' })
  @ApiResponse({ status: 200, description: 'Return paginated association list' })
  findAll(@Query() query: AssociationQueryDto) {
    return this.associationsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get association details by ID' })
  @ApiResponse({ status: 200, description: 'Return association details' })
  findOne(@Param('id') id: string) {
    return this.associationsService.findOne(id);
  }

  @Public()
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update association details (Admin/Association Manager)' })
  @ApiResponse({ status: 200, description: 'Association successfully updated' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  update(
    @Param('id') id: string,
    @Body() updateAssociationDto: UpdateAssociationDto,
    @Request() req,
  ) {
    // If manager, check if they manage this association
    if (req.user.role === UserRole.MANAGER && req.user.associationId !== id) {
      throw new ForbiddenException('You can only update your own association details');
    }
    return this.associationsService.update(id, updateAssociationDto);
  }

  @Public()
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete association (Admin only)' })
  @ApiResponse({ status: 200, description: 'Association successfully deleted' })
  remove(@Param('id') id: string) {
    return this.associationsService.remove(id);
  }
}
