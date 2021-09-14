import { IsUUID, IsNotEmpty } from 'class-validator';

export class BookTalentRequest {
  @IsUUID(4)
  @IsNotEmpty()
  talent: string;
}
