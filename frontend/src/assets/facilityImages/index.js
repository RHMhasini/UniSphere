import F1303 from './lectureHalls/F1303.svg';
import B501 from './lectureHalls/B501.svg';
import F303 from './lectureHalls/F303.svg';
import Lecture_Halls_main from './lectureHalls/Lecture_Halls_main.svg';
import lectureDefault from './lectureHalls/default.svg';
import labDefault from './labs/default.svg';
import meetingDefault from './meetingRooms/default.svg';
import equipmentDefault from './equipment/default.svg';

const lectureHallImages = {
  F1303,
  B501,
  F303,
  Lecture_Halls_main,
  default: lectureDefault,
};

const labImages = {
  default: labDefault,
};

const meetingRoomImages = {
  default: meetingDefault,
};

const equipmentImages = {
  default: equipmentDefault,
};

export { lectureHallImages, labImages, meetingRoomImages, equipmentImages };
