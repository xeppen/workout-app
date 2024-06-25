import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { WorkoutPlansService } from './workout-plans.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';

@Controller('workout-plans')
export class WorkoutPlansController {
  constructor(private readonly workoutPlansService: WorkoutPlansService) {}

  @Post()
  create(@Body() createWorkoutPlanDto: CreateWorkoutPlanDto) {
    return this.workoutPlansService.create(createWorkoutPlanDto);
  }

  @Get()
  findAll() {
    return this.workoutPlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutPlansService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkoutPlanDto: UpdateWorkoutPlanDto
  ) {
    return this.workoutPlansService.update(id, updateWorkoutPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workoutPlansService.remove(id);
  }
}
