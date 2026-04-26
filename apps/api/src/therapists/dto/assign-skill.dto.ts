import { IsString } from 'class-validator';

export class AssignSkillDto {
  @IsString()
  serviceId: string;
}
