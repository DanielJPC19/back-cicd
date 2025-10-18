import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';

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
	async createSchedule(@Body() createScheduleDto: CreateScheduleDto, @Request() req) {
		return await this.appointmentsService.createSchedule(createScheduleDto, req.user.id);
	}

	@Get('schedules')
	@ApiOperation({ summary: 'Get all schedules for the authenticated user' })
	@ApiResponse({ status: 200, description: 'Schedules retrieved successfully' })
	async findAllSchedules(@Query() paginationDto: PaginationDto, @Request() req) {
		return await this.appointmentsService.findAllSchedules(req.user.id, paginationDto);
	}

	@Get('schedules/:id')
	@ApiOperation({ summary: 'Get a schedule by ID' })
	@ApiResponse({ status: 200, description: 'Schedule retrieved successfully' })
	@ApiResponse({ status: 404, description: 'Schedule not found' })
	async findOneSchedule(@Param('id') id: string, @Request() req) {
		return await this.appointmentsService.findOneSchedule(+id, req.user.id);
	}

	@Patch('schedules/:id')
	@ApiOperation({ summary: 'Update a schedule' })
	@ApiResponse({ status: 200, description: 'Schedule updated successfully' })
	@ApiResponse({ status: 404, description: 'Schedule not found' })
	async updateSchedule(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto, @Request() req) {
		return await this.appointmentsService.updateSchedule(+id, updateScheduleDto, req.user.id);
	}

	@Delete('schedules/:id')
	@ApiOperation({ summary: 'Delete a schedule' })
	@ApiResponse({ status: 200, description: 'Schedule deleted successfully' })
	@ApiResponse({ status: 404, description: 'Schedule not found' })
	async removeSchedule(@Param('id') id: string, @Request() req) {
		await this.appointmentsService.removeSchedule(+id, req.user.id);
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
	async findAppointmentsByVeterinarian(@Param('veterinarianId') veterinarianId: string, @Query() paginationDto: PaginationDto) {
		return await this.appointmentsService.findAppointmentsByVeterinarian(+veterinarianId, paginationDto);
	}

	@Get('pet/:petId')
	@ApiOperation({ summary: 'Get appointments by pet ID' })
	@ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
	async findAppointmentsByPet(@Param('petId') petId: string, @Query() paginationDto: PaginationDto) {
		return await this.appointmentsService.findAppointmentsByPet(+petId, paginationDto);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get an appointment by ID' })
	@ApiResponse({ status: 200, description: 'Appointment retrieved successfully' })
	@ApiResponse({ status: 404, description: 'Appointment not found' })
	async findOneAppointment(@Param('id') id: string) {
		return await this.appointmentsService.findOneAppointment(+id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update an appointment' })
	@ApiResponse({ status: 200, description: 'Appointment updated successfully' })
	@ApiResponse({ status: 404, description: 'Appointment not found' })
	@ApiResponse({ status: 409, description: 'Time conflict' })
	async updateAppointment(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
		return await this.appointmentsService.updateAppointment(+id, updateAppointmentDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete an appointment' })
	@ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
	@ApiResponse({ status: 404, description: 'Appointment not found' })
	async removeAppointment(@Param('id') id: string) {
		await this.appointmentsService.removeAppointment(+id);
		return { message: 'Appointment deleted successfully' };
	}
}
