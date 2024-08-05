import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { WorkoutPlansService } from './workout-plans.service';
import {
  CreateWorkoutPlanDto,
  ProgressWorkoutPlanDto,
} from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';

@Controller('workout-plans')
export class WorkoutPlansController {
  private readonly logger = new Logger(WorkoutPlansController.name);

  constructor(private readonly workoutPlansService: WorkoutPlansService) {}

  @Post()
  async create(@Body() createWorkoutPlanDto: CreateWorkoutPlanDto) {
    this.logger.log(
      `Creating workout plan: ${JSON.stringify(createWorkoutPlanDto)}`
    );
    const result = await this.workoutPlansService.create(createWorkoutPlanDto);
    this.logger.log(`Created workout plan with id: ${result.id}`);
    return result;
  }

  @Get()
  async findAll() {
    this.logger.log('Finding all workout plans');
    return this.workoutPlansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Finding workout plan with id: ${id}`);
    const workoutPlan = await this.workoutPlansService.findOne(id);
    if (!workoutPlan) {
      this.logger.warn(`Workout plan with id ${id} not found`);
      throw new NotFoundException('Workout plan not found');
    }
    return workoutPlan;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkoutPlanDto: UpdateWorkoutPlanDto
  ) {
    this.logger.log(`Updating workout plan with id: ${id}`);
    this.logger.debug(`Update data: ${JSON.stringify(updateWorkoutPlanDto)}`);
    try {
      const result = await this.workoutPlansService.update(
        id,
        updateWorkoutPlanDto
      );
      this.logger.log(`Successfully updated workout plan with id: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating workout plan: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`Removing workout plan with id: ${id}`);
    return this.workoutPlansService.remove(id);
  }

  @Post(':id/sessions')
  async createSession(@Param('id') id: string, @Body('userId') userId: string) {
    this.logger.log(`Creating session for workout plan with id: ${id}`);
    return this.workoutPlansService.createSession(id, userId);
  }

  @Post('progress-compound-lifts')
  @HttpCode(200)
  async progressCompoundLifts(@Body() progressDto: ProgressWorkoutPlanDto) {
    return this.workoutPlansService.progressCompoundLifts(progressDto);
  }

  @Post(':id/clone')
  async clonePlan(@Param('id') id: string, @Body('name') name: string) {
    this.logger.log(`Cloning workout plan with id: ${id}`);
    return this.workoutPlansService.clonePlan(id, name);
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: string) {
    this.logger.log(`Getting statistics for workout plan with id: ${id}`);
    return this.workoutPlansService.getStatistics(id);
  }
}
