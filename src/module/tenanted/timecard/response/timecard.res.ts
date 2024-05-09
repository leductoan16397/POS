import { BaseResponse } from 'src/common/common.response';
import { TimecardHistoryEvent } from '../entity/timecard.history.entity';
import { TimecardStatus } from '../entity/timecard.entity';

export class TimecardData extends BaseResponse {
  clockIn?: Date;
  clockOut?: Date;
  employee: string;
  store: string;
  time: number;
  histories?: TimecardHistoryData[];
  status: TimecardStatus;

  constructor(partial: Partial<TimecardData>) {
    super();
    Object.assign(this, partial);
  }
}

export class TimecardHistoryData extends BaseResponse {
  clockIn?: Date;
  clockOut?: Date;
  event: TimecardHistoryEvent;

  constructor(partial: Partial<TimecardHistoryData>) {
    super();
    Object.assign(this, partial);
  }
}
