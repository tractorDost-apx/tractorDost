'use client';

import React from 'react';
import { DealerInventoryItem } from '@/types/models/dealerInventory';
import { CreateDealerUsedListingModal } from '@/app/(dealer)/dealer/used-listings/components/CreateDealerUsedListingModal';

interface CreateUsedListingModalProps {
  item: DealerInventoryItem | null;
  dealerName?: string | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function CreateUsedListingModal({
  item,
  dealerName,
  onClose,
  onSuccess,
}: CreateUsedListingModalProps) {
  if (!item) return null;

  return (
    <CreateDealerUsedListingModal
      isOpen={Boolean(item)}
      onClose={onClose}
      onSuccess={onSuccess}
      initialData={{
        brand: item.brand,
        tractorName: item.tractorName,
        customModel: item.customModel,
        hp: item.hp,
      }}
    />
  );
}
