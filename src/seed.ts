// src/seed.ts
import { AppDataSource } from "./data-source";
import { ExerciseSeed } from "./seeds/ExerciseSeed";
import { TestDataSeed } from "./seeds/TestDataSeed";
import { WorkoutPlaceSeed } from "./seeds/WorkoutPlaceSeed";

AppDataSource.initialize()
  .then(async (dataSource) => {
    console.log("Database initialized for seeding...");

    // 실행: EXERCISE 테이블에 초기 데이터 넣기
    await ExerciseSeed(dataSource);
    
    // 실행: 장소 데이터 넣기
    await WorkoutPlaceSeed(dataSource);
    
    // 실행: 테스트용 데이터 넣기 (회원, 운동 기록 등)
    await TestDataSeed(dataSource);


    console.log("Seeding completed!");
    process.exit(0); // 필요 시 프로세스 종료
  })
  .catch((err) => {
    console.error("Error during seeding:", err);
    process.exit(1);
  });
