import { unslugify } from '@/lib/utils/slug';

export function getUsedTractorStateSeo(stateSlug: string) {
  const stateName = unslugify(stateSlug);
  return {
    title: `Used Tractors in ${stateName} - Second Hand Tractors for Sale`,
    description: `Buy verified second hand tractors in ${stateName}. Browse 100% inspected used tractors from Mahindra, Swaraj, John Deere with loan & RTO assistance.`,
    keywords: [
      `Used Tractors in ${stateName}`,
      `Second Hand Tractor ${stateName}`,
      `Purana Tractor ${stateName}`,
      `Buy Used Tractor ${stateName}`,
    ],
  };
}

export function getUsedTractorDistrictSeo(stateSlug: string, districtSlug: string) {
  const stateName = unslugify(stateSlug);
  const districtName = unslugify(districtSlug);
  return {
    title: `Used Tractors in ${districtName}, ${stateName} - Best Prices`,
    description: `Discover top deals on second hand tractors in ${districtName}, ${stateName}. Certified tractors with inspection reports, low down payment loans, and direct farmer contact.`,
    keywords: [
      `Used Tractors in ${districtName}`,
      `Second Hand Tractor ${districtName}`,
      `Tractor Mandi ${districtName}`,
      `Old Tractor ${districtName}`,
    ],
  };
}

export function getComparisonSeo(slug1: string, slug2: string) {
  const model1 = unslugify(slug1);
  const model2 = unslugify(slug2);
  return {
    title: `${model1} vs ${model2} - Detailed Comparison, Price & Specs`,
    description: `Compare ${model1} vs ${model2} head to head. Check engine HP, PTO power, mileage, lifting capacity, price in India, and user ratings to choose the best tractor.`,
    keywords: [
      `${model1} vs ${model2}`,
      `Compare ${model1} and ${model2}`,
      `${model1} comparison`,
      `Which tractor is better ${model1} or ${model2}`,
    ],
  };
}

export function getBrandCatalogSeo(brandName: string) {
  return {
    title: `${brandName} Tractors Price List 2026, Specs & New Models`,
    description: `Check latest 2026 on-road prices for all ${brandName} tractors in India. Compare HP, fuel efficiency, warranty, and connect with authorized ${brandName} dealers.`,
    keywords: [
      `${brandName} Tractor Price`,
      `New ${brandName} Tractors`,
      `${brandName} Tractor Models`,
      `${brandName} Dealership`,
    ],
  };
}
