import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { WorkoutOfTheDay } from "../entities/WorkoutOfTheDay";
import { WorkoutDetail } from "../entities/WorkoutDetail";
import { Exercise } from "../entities/Exercise";
import { WorkoutComment } from "../entities/WorkoutComment";
import { BodyLog } from "../entities/BodyLog";
import { UserFollow } from "../entities/UserFollow";
import { WorkoutLike } from "../entities/WorkoutLike";
import { WorkoutPlace } from "../entities/WorkoutPlace";
import bcrypt from "bcrypt";

export const TestDataSeed = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const workoutRepo = dataSource.getRepository(WorkoutOfTheDay);
  const detailRepo = dataSource.getRepository(WorkoutDetail);
  const exerciseRepo = dataSource.getRepository(Exercise);
  const commentRepo = dataSource.getRepository(WorkoutComment);
  const bodyLogRepo = dataSource.getRepository(BodyLog);
  const followRepo = dataSource.getRepository(UserFollow);
  const likeRepo = dataSource.getRepository(WorkoutLike);
  const placeRepo = dataSource.getRepository(WorkoutPlace);

  console.log("Starting Diversified Mega Test Data Seeding...");

  // 1. 기본 데이터 확보
  const hashedPassword = await bcrypt.hash("test1234!", 10);
  const exercises = await exerciseRepo.find();
  const places = await placeRepo.find();
  
  if (exercises.length === 0 || places.length === 0) {
    console.log("Exercises or Places not found. Run respective seeds first.");
    return;
  }

  // 2. 사용자 확보
  let minsu = await userRepo.findOneBy({ userId: "minsu705" });
  if (!minsu) {
    minsu = userRepo.create({
      userId: "minsu705",
      userPw: await bcrypt.hash("minsy^011", 10),
      userNickname: "민수",
      userEmail: "minsu705@gmail.com",
      isVerified: true,
    });
    await userRepo.save(minsu);
  }

  const nickNames = ["근육맨", "헬스장귀신", "다이어터킴", "철의의지", "단백질쉐이크", "스쿼트장인", "런닝맨", "필라테스여왕", "바디프로필도전", "운동하는직장인"];
  const allUsers: User[] = [minsu];
  for (let i = 0; i < nickNames.length; i++) {
    const userId = `user_${i + 1}`;
    let user = await userRepo.findOneBy({ userId });
    if (!user) {
      user = userRepo.create({
        userId,
        userPw: hashedPassword,
        userNickname: nickNames[i],
        userEmail: `${userId}@example.com`,
        isVerified: true,
        profileImageUrl: `https://i.pravatar.cc/150?u=${userId}`,
      });
      await userRepo.save(user);
    }
    allUsers.push(user);
  }

  // 3. 운동 기록 생성 (최근 60일치)
  console.log("Generating diversified workouts for everyone...");
  const routines = ["가슴", "등", "하체", "어깨"]; // 웨이트 위주 루틴
  
  for (const user of allUsers) {
    const isMinsu = user.userId === "minsu705";
    const dayCount = isMinsu ? 60 : 30;

    for (let d = dayCount; d >= 0; d--) {
      // 60% 확률로 운동 (휴식일 포함)
      if (Math.random() > 0.6) continue;

      const date = new Date();
      date.setDate(date.getDate() - d);

      const mainType = routines[Math.floor(Math.random() * routines.length)];
      const randomPlace = places[Math.floor(Math.random() * places.length)];

      const workout = workoutRepo.create({
        user,
        workoutPlace: randomPlace,
        recordDate: date,
        workoutDiary: `${mainType} 웨이트 트레이닝 완료! 🔥`,
        workoutPhoto: `https://picsum.photos/seed/${user.userId}${d}/800/600`,
        mainExerciseType: mainType,
        isDeleted: false,
      });
      const savedWorkout = await workoutRepo.save(workout);

      // 해당 부위 운동 3~4종류 추가
      const targetExs = exercises.filter(e => e.exerciseType === mainType).sort(() => 0.5 - Math.random()).slice(0, 3);
      for (const ex of targetExs) {
        for (let s = 1; s <= 4; s++) {
          await detailRepo.save(detailRepo.create({
            workoutOfTheDay: savedWorkout,
            exercise: ex,
            weight: 20 + Math.floor(Math.random() * 60),
            reps: 8 + Math.floor(Math.random() * 5),
            setIndex: s,
          }));
        }
      }

      // 유산소는 마무리로 30% 확률로만 추가
      if (Math.random() > 0.7) {
        const running = exercises.find(e => e.exerciseName === "러닝");
        if (running) {
          await detailRepo.save(detailRepo.create({
            workoutOfTheDay: savedWorkout,
            exercise: running,
            recordTime: 600 + Math.floor(Math.random() * 1200),
            distance: 1000 + Math.floor(Math.random() * 3000),
            setIndex: 1,
          }));
        }
      }

      // 소셜 활동
      savedWorkout.workoutLikeCount = Math.floor(Math.random() * 10);
      await workoutRepo.save(savedWorkout);
    }
  }

  console.log("Diversified Mega Test Data Seeding Completed!");
};
