import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { WorkoutSessionsService } from './workout-sessions.service';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { AddExerciseDto } from './dto/add-exercise.dto';
import { AddSetDto, UpdateSetDto } from './dto/add-set.dto';

@Controller('workout-sessions')
export class WorkoutSessionsController {
  constructor(
    private readonly workoutSessionsService: WorkoutSessionsService
  ) {}

  @Post()
  create(@Body() createWorkoutSessionDto: CreateWorkoutSessionDto) {
    return this.workoutSessionsService.create(createWorkoutSessionDto);
  }

  @Get()
  findAll() {
    return this.workoutSessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutSessionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkoutSessionDto: UpdateWorkoutSessionDto
  ) {
    return this.workoutSessionsService.update(id, updateWorkoutSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workoutSessionsService.remove(id);
  }

  @Post(':id/exercises')
  @HttpCode(200)
  addExerciseToSession(
    @Param('id') id: string,
    @Body() addExerciseDto: AddExerciseDto
  ) {
    return this.workoutSessionsService.addExerciseToSession(id, addExerciseDto);
  }

  @Post(':id/exercises/:exerciseId/sets')
  @HttpCode(200)
  addSetToExercise(
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
    @Body() addSetDto: AddSetDto
  ) {
    return this.workoutSessionsService.addSetToExercise(
      id,
      exerciseId,
      addSetDto
    );
  }

  @Patch(':id/exercises/:exerciseId/sets/:setId')
  updateSet(
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
    @Param('setId') setId: string,
    @Body() updateSetDto: UpdateSetDto
  ) {
    return this.workoutSessionsService.updateSet(
      id,
      exerciseId,
      setId,
      updateSetDto
    );
  }

  @Delete(':id/exercises/:exerciseId/sets/:setId')
  removeSet(
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
    @Param('setId') setId: string
  ) {
    return this.workoutSessionsService.removeSet(id, exerciseId, setId);
  }

  @Delete(':id/exercises/:exerciseId')
  removeExerciseFromSession(
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string
  ) {
    return this.workoutSessionsService.removeExerciseFromSession(
      id,
      exerciseId
    );
  }
}
