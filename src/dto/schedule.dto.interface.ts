import { MeetingDate } from "src/entity/meetingDate.entity";

export interface Schedule {
    nickname: string,
    selected_items: MeetingDate[]
}