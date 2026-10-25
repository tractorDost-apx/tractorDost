export interface EquipmentCategoryMeta {
  id: string;
  name: string;
  slug: string;
  description: string;
  popularImplements: string[];
  powerRequirementHp: string;
}

export const EQUIPMENT_CATEGORIES: EquipmentCategoryMeta[] = [
  {
    id: 'tillage',
    name: 'Tillage & Land Preparation',
    slug: 'tillage',
    description: 'Soil preparation implements including ploughs, harrows, and rotary tillers.',
    popularImplements: ['Rotavator', 'Reversible MB Plough', 'Disc Harrow', 'Cultivator', 'Subsoiler'],
    powerRequirementHp: '30 HP - 75 HP',
  },
  {
    id: 'sowing',
    name: 'Sowing & Planting',
    slug: 'sowing',
    description: 'High precision seed drills and planters ensuring optimal germination.',
    popularImplements: ['Super Seeder', 'Seed Cum Fertilizer Drill', 'Happy Seeder', 'Pneumatic Planter'],
    powerRequirementHp: '35 HP - 60 HP',
  },
  {
    id: 'harvesting',
    name: 'Harvesting & Threshing',
    slug: 'harvesting',
    description: 'Grain harvesting, cutting, and grain separation machines for maximum yield recovery.',
    popularImplements: ['Combine Harvester', 'Multi-Crop Thresher', 'Tractor Mounted Reaper', 'Groundnut Digger'],
    powerRequirementHp: '35 HP - 100 HP',
  },
  {
    id: 'residue-management',
    name: 'Crop Residue Management',
    slug: 'residue-management',
    description: 'Straw balers, mulchers, and shredders preventing stubble burning and restoring organic carbon.',
    popularImplements: ['Square Baler', 'Round Baler', 'Paddy Straw Chopper', 'Mulcher', 'Shredder'],
    powerRequirementHp: '45 HP - 75 HP',
  },
  {
    id: 'haulage',
    name: 'Haulage & Material Handling',
    slug: 'haulage',
    description: 'Heavy duty trailers and loaders for crop transport and farm earthmoving.',
    popularImplements: ['Tipping Trailer (Trolley)', 'Front End Loader', 'Post Hole Digger', 'Laser Land Leveller'],
    powerRequirementHp: '35 HP - 70 HP',
  },
];
