import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../common/decorators/user.decorator';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';
import { UserContextDto } from '../../common/dto/user-context.dto';

@ApiTags('appointments')
@ApiBearerAuth('jwt-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('appointments')
export class AppointmentsController {
	constructor(private readonly appointmentsService: AppointmentsService) {}

	// Schedule endpoints
	@Post('schedules')
	@ApiOperation({ summary: 'Create a new schedule' })
	@ApiResponse({ status: 201, description: 'Schedule created successfully' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	async createSchedule(@Body() createScheduleDto: CreateScheduleDto, @User() user: UserContextDto) {
		return await this.appointmentsService.createSchedule(createScheduleDto, user.userId);
	}

	@Get('schedules')
	@ApiOperation({ summary: 'Get all schedules for the authenticated user' })
	@ApiResponse({ status: 200, description: 'Schedules retrieved successfully' })
	async findAllSchedules(@Query() paginationDto: PaginationDto, @User() user: UserContextDto) {
		return await this.appointmentsService.findAllSchedules(user.userId, paginationDto);
	}

	@Get('schedules/:id')
	@ApiOperation({ summary: 'Get a schedule by ID' })
	@ApiResponse({ status: 200, description: 'Schedule retrieved successfully' })
	@ApiResponse({ status: 404, description: 'Schedule not found' })
	async findOneSchedule(@Param('id', ParseIntPipe) id: number, @User() user: UserContextDto) {
		return await this.appointmentsService.findOneSchedule(id, user.userId);
	}

	@Patch('schedules/:id')
	@ApiOperation({ summary: 'Update a schedule' })
	@ApiResponse({ status: 200, description: 'Schedule updated successfully' })
	@ApiResponse({ status: 404, description: 'Schedule not found' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	async updateSchedule(@Param('id', ParseIntPipe) id: number, @Body() updateScheduleDto: UpdateScheduleDto, @User() user: UserContextDto) {
		return await this.appointmentsService.updateSchedule(id, updateScheduleDto, user.userId);
	}

	@Delete('schedules/:id')
	@ApiOperation({ summary: 'Delete a schedule' })
	@ApiResponse({ status: 200, description: 'Schedule deleted successfully' })
	@ApiResponse({ status: 404, description: 'Schedule not found' })
	async removeSchedule(@Param('id', ParseIntPipe) id: number, @User() user: UserContextDto) {
		await this.appointmentsService.removeSchedule(id, user.userId);
		return { message: 'Schedule deleted successfully' };
	}

	// Appointment endpoints
	@Post()
	@ApiOperation({ summary: 'Create a new appointment' })
	@ApiResponse({ status: 201, description: 'Appointment created successfully' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@ApiResponse({ status: 409, description: 'Time conflict' })
	async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
		return await this.appointmentsService.createAppointment(createAppointmentDto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all appointments' })
	@ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
	async findAllAppointments(@Query() paginationDto: PaginationDto) {
		return await this.appointmentsService.findAllAppointments(paginationDto);
	}

	@Get('veterinarian/:veterinarianId')
	@ApiOperation({ summary: 'Get appointments by veterinarian ID' })
	@ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
	async findAppointmentsByVeterinarian(@Param('veterinarianId', ParseIntPipe) veterinarianId: number, @Query() paginationDto: PaginationDto) {
		return await this.appointmentsService.findAppointmentsByVeterinarian(veterinarianId, paginationDto);
	}

	@Get('pet/:petId')
	@ApiOperation({ summary: 'Get appointments by pet ID' })
	@ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
	async findAppointmentsByPet(@Param('petId', ParseIntPipe) petId: number, @Query() paginationDto: PaginationDto) {
		return await this.appointmentsService.findAppointmentsByPet(petId, paginationDto);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get an appointment by ID' })
	@ApiResponse({ status: 200, description: 'Appointment retrieved successfully' })
	@ApiResponse({ status: 404, description: 'Appointment not found' })
	async findOneAppointment(@Param('id', ParseIntPipe) id: number) {
		return await this.appointmentsService.findOneAppointment(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update an appointment' })
	@ApiResponse({ status: 200, description: 'Appointment updated successfully' })
	@ApiResponse({ status: 404, description: 'Appointment not found' })
	@ApiResponse({ status: 409, description: 'Time conflict' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	async updateAppointment(@Param('id', ParseIntPipe) id: number, @Body() updateAppointmentDto: UpdateAppointmentDto) {
		return await this.appointmentsService.updateAppointment(id, updateAppointmentDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete an appointment' })
	@ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
	@ApiResponse({ status: 404, description: 'Appointment not found' })
	async removeAppointment(@Param('id', ParseIntPipe) id: number) {
		await this.appointmentsService.removeAppointment(id);
		return { message: 'Appointment deleted successfully' };
	}
}
