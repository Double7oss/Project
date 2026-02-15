import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PartsService } from './parts.service';
import { CreatePartDto, UpdatePartDto } from './parts.dto';

@ApiTags('parts')
@Controller('parts')
export class PartsController {
    constructor(private readonly partsService: PartsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new part' })
    @ApiResponse({ status: 201, description: 'Part created successfully' })
    create(@Body() createPartDto: CreatePartDto) {
        return this.partsService.create(createPartDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all parts' })
    @ApiResponse({ status: 200, description: 'Return all parts' })
    findAll() {
        return this.partsService.findAll();
    }

    @Get('low-stock')
    @ApiOperation({ summary: 'Get parts with low stock' })
    @ApiResponse({ status: 200, description: 'Return parts below minimum stock level' })
    findLowStock() {
        return this.partsService.findLowStock();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a part by ID' })
    @ApiResponse({ status: 200, description: 'Return the part' })
    @ApiResponse({ status: 404, description: 'Part not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.partsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a part' })
    @ApiResponse({ status: 200, description: 'Part updated successfully' })
    @ApiResponse({ status: 404, description: 'Part not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePartDto: UpdatePartDto,
    ) {
        return this.partsService.update(id, updatePartDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a part' })
    @ApiResponse({ status: 200, description: 'Part deleted successfully' })
    @ApiResponse({ status: 404, description: 'Part not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.partsService.remove(id);
    }
}
