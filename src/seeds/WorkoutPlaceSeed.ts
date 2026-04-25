import { DataSource } from "typeorm";
import { WorkoutPlace } from "../entities/WorkoutPlace";

export const WorkoutPlaceSeed = async (dataSource: DataSource) => {
  const placeRepo = dataSource.getRepository(WorkoutPlace);

  const initialPlaces = [
    {
      kakaoPlaceId: "1",
      placeName: "에이치코어 휘트니스 강남점",
      addressName: "서울 강남구 역삼동 824-25",
      roadAddressName: "서울 강남구 테헤란로4길 25",
      x: 127.0301,
      y: 37.4951,
    },
    {
      kakaoPlaceId: "2",
      placeName: "스포애니 역삼역점",
      addressName: "서울 강남구 역삼동 736-22",
      roadAddressName: "서울 강남구 테헤란로 151",
      x: 127.0365,
      y: 37.5006,
    },
    {
      kakaoPlaceId: "3",
      placeName: "고투휘트니스 상암점",
      addressName: "서울 마포구 상암동 1605",
      roadAddressName: "서울 마포구 월드컵북로 402",
      x: 126.8921,
      y: 37.5794,
    },
    {
      kakaoPlaceId: "4",
      placeName: "애니타임피트니스 판교점",
      addressName: "경기 성남시 분당구 삼평동 670",
      roadAddressName: "경기 성남시 분당구 대왕판교로 660",
      x: 127.1086,
      y: 37.4012,
    },
    {
      kakaoPlaceId: "5",
      placeName: "짐박스 피트니스 신림점",
      addressName: "서울 관악구 신림동 1433-46",
      roadAddressName: "서울 관악구 신림로 340",
      x: 126.9297,
      y: 37.4842,
    }
  ];

  console.log("Seeding Workout Places...");
  for (const place of initialPlaces) {
    const exist = await placeRepo.findOneBy({ kakaoPlaceId: place.kakaoPlaceId });
    if (!exist) {
      await placeRepo.save(placeRepo.create(place));
      console.log(`Inserted Place: ${place.placeName}`);
    }
  }
};
