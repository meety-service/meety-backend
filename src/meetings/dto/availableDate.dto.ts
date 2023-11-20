import { IsString } from "class-validator";

export class AvailableDate {
    @IsString()
    date: string;
}