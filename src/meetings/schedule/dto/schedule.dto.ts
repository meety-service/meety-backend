import { MeetingDate } from "src/entity/meetingDate.entity";

export class SelectTimetableDto {
    date: string;
    times: string[];
}

export class ScheduleDto {
    nickname: string;
    selected_items: SelectTimetableDto[];
}