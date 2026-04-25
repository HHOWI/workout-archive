import { AppDataSource } from "../data-source";
import { WorkoutOfTheDay } from "../entities/WorkoutOfTheDay";
import { Like } from "typeorm";

async function cleanupDiaryText() {
  try {
    await AppDataSource.initialize();
    console.log("Data Source initialized for cleanup.");

    const workoutRepo = AppDataSource.getRepository(WorkoutOfTheDay);
    
    // '장소:' 가 포함된 모든 기록 조회
    const workoutsToFix = await workoutRepo.find({
      where: {
        workoutDiary: Like("%장소: %")
      }
    });

    console.log(`Found ${workoutsToFix.length} records to cleanup.`);

    for (const workout of workoutsToFix) {
      // "가슴 웨이트 트레이닝 완료! 장소: XXX. 오운완!" -> "가슴 웨이트 트레이닝 완료! 🔥"
      // "장소:" 앞부분만 추출하거나, 패턴에 따라 수정
      const match = workout.workoutDiary.match(/^(.*?) 완료!/);
      if (match && match[1]) {
        workout.workoutDiary = `${match[1]} 웨이트 트레이닝 완료! 🔥`;
      } else {
        workout.workoutDiary = "오늘도 건강하게 운동 완료! 🔥";
      }
    }

    if (workoutsToFix.length > 0) {
      await workoutRepo.save(workoutsToFix);
      console.log("Successfully cleaned up all redundant text.");
    } else {
      console.log("No redundant text found.");
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
}

cleanupDiaryText();
