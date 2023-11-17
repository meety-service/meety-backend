import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimezonesModule } from './timezones/timezones.module';
import { MeetingsScheduleModules} from './meetings/schedule/meetings.schedule.module';
import { UsersModule } from './users/users.module';
import { MeetingsVoteModule } from './meetings/votes/meetings.votes.module';
import { MeetingsModule } from './meetings/meetings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TimezonesModule,
    MeetingsScheduleModules,
    MeetingsVoteModule,
    UsersModule,
    MeetingsModule,
    TypeOrmModule.forRoot({
      type: 'mysql', //Database 설정
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['dist/**/*.entity.{ts,js}'], // Entity 연결
      synchronize: true, //중요 : 배포할때 false로 바꿔야함   true 값을 설정하면 어플리케이션을 다시 실행할 때 엔티티안에서 수정된 컬럼의 길이 타입 변경값등을 해당 테이블을 Drop한 후 다시 생성해준다.
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
