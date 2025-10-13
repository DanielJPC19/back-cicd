import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../core/auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';

@ApiTags('pets')
@ApiBearerAuth('jwt-auth')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('pets')
export class PetsController {

	constructor(
		private readonly petsService: PetsService
	) {}

	@ApiOperation({ summary: 'Crear una mascota' })
	@ApiBody({ type: CreatePetDto })
	@ApiResponse({ status: 201, description: 'Mascota creada correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Propietario no encontrado.' })
	@ApiResponse({ status: 409, description: 'Conflicto, ya existe una mascota con ese microchip.' })
	@Permissions('pet_create')
	@Post()
	async create(@Body() createPetDto: CreatePetDto) {
		const result = await this.petsService.create(createPetDto);
		return result;
	}

	@ApiOperation({ summary: 'Listar todas las mascotas' })
	@ApiResponse({ status: 200, description: 'Lista de mascotas obtenida correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@Permissions('pet_read')
	@Get()
	async findAll() {
		const result = await this.petsService.findAll();
		return result;
	}

	@ApiOperation({ summary: 'Obtener una mascota por ID' })
	@ApiParam({ name: 'id', description: 'ID de la mascota', type: 'number' })
	@ApiResponse({ status: 200, description: 'Mascota obtenida correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Mascota no encontrada.' })
	@Permissions('pet_read')
	@Get(':id')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		const result = await this.petsService.findOne(id);
		return result;
	}

	@ApiOperation({ summary: 'Obtener mascotas por propietario' })
	@ApiParam({ name: 'ownerId', description: 'ID del propietario', type: 'number' })
	@ApiResponse({ status: 200, description: 'Mascotas del propietario obtenidas correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Propietario no encontrado.' })
	@Permissions('pet_read')
	@Get('owner/:ownerId')
	async findByOwner(@Param('ownerId', ParseIntPipe) ownerId: number) {
		const result = await this.petsService.findByOwner(ownerId);
		return result;
	}

	@ApiOperation({ summary: 'Obtener mascotas por especie' })
	@ApiParam({ name: 'speciesId', description: 'ID de la especie', type: 'number' })
	@ApiResponse({ status: 200, description: 'Mascotas de la especie obtenidas correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Especie no encontrada.' })
	@Permissions('pet_read')
	@Get('by-species/:speciesId')
	async findBySpecies(@Param('speciesId', ParseIntPipe) speciesId: number) {
		const result = await this.petsService.findBySpecies(speciesId);
		return result;
	}

	@ApiOperation({ summary: 'Actualizar una mascota' })
	@ApiParam({ name: 'id', description: 'ID de la mascota', type: 'number' })
	@ApiBody({ type: UpdatePetDto })
	@ApiResponse({ status: 200, description: 'Mascota actualizada correctamente.' })
	@ApiResponse({ status: 400, description: 'Datos inválidos o faltantes.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Mascota no encontrada.' })
	@ApiResponse({ status: 409, description: 'Conflicto, ya existe una mascota con ese microchip.' })
	@Permissions('pet_update')
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updatePetDto: UpdatePetDto,
	) {
		const result = await this.petsService.update(id, updatePetDto);
		return result;
	}

	@ApiOperation({ summary: 'Eliminar una mascota' })
	@ApiParam({ name: 'id', description: 'ID de la mascota', type: 'number' })
	@ApiResponse({ status: 204, description: 'Mascota eliminada correctamente.' })
	@ApiResponse({ status: 401, description: 'No autenticado — JWT inválido o no provisto.' })
	@ApiResponse({ status: 403, description: 'Permisos insuficientes' })
	@ApiResponse({ status: 404, description: 'Mascota no encontrada.' })
	@Permissions('pet_delete')
	@Delete(':id')
	@HttpCode(204)
	async removeById(@Param('id', ParseIntPipe) id: number) {
		await this.petsService.removeById(id);
	}
}