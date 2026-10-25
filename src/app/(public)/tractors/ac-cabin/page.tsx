import React from 'react';
import { Metadata } from 'next';
import { TractorCategoryClient } from '@/components/tractors/TractorCategoryClient';

export const metadata: Metadata = {
  title: 'AC Cabin Tractors in India: Price, Comfort & Heavy Duty Models | TractorDost',
  description:
    'Discover factory-fitted AC cabin tractors in India from John Deere, Mahindra, Solis, and New Holland for extreme summer heat, dust protection, and 12-hour operator comfort.',
};

export default function ACCabinTractorsPage() {
  return (
    <TractorCategoryClient
      title="AC Cabin Tractors in India"
      subtitle="Factory-fitted climate-controlled cabins protecting operators from severe 45°C summer heat, flying chaff, dust storms, and heavy monsoon rains."
      badge="All-Weather Comfort"
      categoryTag="ac-cabin"
      seoContent="<h2 class='text-xl font-bold text-foreground mb-3'>The Modern Advantage of AC Cabins</h2><p class='mb-3'>Equipped with sealed acoustic insulation, micro-particle air filters, and heavy HVAC chilling units, AC cabin tractors eliminate operator fatigue during 12-hour continuous harvesting and laser-leveling shifts.</p><p>Features include 360-degree panoramic tinted glass, pneumatic suspension seats, Bluetooth infotainment systems, and mobile charging ports.</p>"
    />
  );
}
