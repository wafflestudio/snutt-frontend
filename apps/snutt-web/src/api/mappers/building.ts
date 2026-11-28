import type { SnuttV2 } from '@sf/snutt-api';
import type { Building, Campus } from '@/domain/building';

// v2 건물 응답 → domain 타입. 서버는 null 인 필드를 보내지 않는다

const CAMPUSES: Record<SnuttV2.BuildingResponse['campus'], Campus> = {
  GWANAK: 'gwanak',
  YEONGEON: 'yeongeon',
  PYEONGCHANG: 'pyeongchang',
};

export const toBuilding = (building: SnuttV2.BuildingResponse): Building => ({
  id: String(building.id),
  number: building.buildingNumber,
  nameKor: building.buildingNameKor,
  nameEng: building.buildingNameEng,
  campus: CAMPUSES[building.campus],
  location: building.location ? { latitude: building.location.latitude, longitude: building.location.longitude } : null,
});
