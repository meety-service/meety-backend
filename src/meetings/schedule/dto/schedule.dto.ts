import { MeetingDate } from "src/entity/meetingDate.entity";

export class ScheduleDto {
    nickname: string;
    selected_items: MeetingDate[]
}