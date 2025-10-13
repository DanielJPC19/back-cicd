import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../core/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { SpeciesService } from './species.service';

@ApiTags('Species')
@Controller('species')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class SpeciesController {
	constructor(private readonly speciesService: SpeciesService) {}

	@Post()
	@Permissions('CREATE_SPECIES')
	@ApiOperation({ summary: 'Crear una nueva especie' })
	@ApiResponse({ status: 201, description: 'Especie creada exitosamente.' })
	@ApiResponse({ status: 409, description: 'Ya existe una especie con ese nombre.' })
	async create(@Body() createSpeciesDto: CreateSpeciesDto) {
		return await this.speciesService.create(createSpeciesDto);
	}

	@Get()
	@Permissions('READ_SPECIES')
	@ApiOperation({ summary: 'Obtener todas las especies' })
	@ApiResponse({ status: 200, description: 'Lista de especies obtenida exitosamente.' })
	async findAll() {
		return await this.speciesService.findAll();
	}

	@Get(':id')
	@Permissions('READ_SPECIES')
	@ApiOperation({ summary: 'Obtener una especie por ID' })
	@ApiResponse({ status: 200, description: 'Especie encontrada exitosamente.' })
	@ApiResponse({ status: 404, description: 'Especie no encontrada.' })
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return await this.speciesService.findOne(id);
	}

	@Patch(':id')
	@Permissions('UPDATE_SPECIES')
	@ApiOperation({ summary: 'Actualizar una especie' })
	@ApiResponse({ status: 200, description: 'Especie actualizada exitosamente.' })
	@ApiResponse({ status: 404, description: 'Especie no encontrada.' })
	@ApiResponse({ status: 409, description: 'Ya existe una especie con ese nombre.' })
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateSpeciesDto: UpdateSpeciesDto,
	) {
		return await this.speciesService.update(id, updateSpeciesDto);
	}

	@Delete(':id')
	@Permissions('DELETE_SPECIES')
	@HttpCode(204)
	@ApiOperation({ summary: 'Eliminar una especie' })
	@ApiResponse({ status: 204, description: 'Especie eliminada exitosamente.' })
	@ApiResponse({ status: 404, description: 'Especie no encontrada.' })
	async remove(@Param('id', ParseIntPipe) id: number) {
		await this.speciesService.remove(id);
	}
}