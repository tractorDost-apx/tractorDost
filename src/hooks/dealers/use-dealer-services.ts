'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/store/AuthContext';
import { dealerAPI } from '@/lib/api/dealers';
import { serviceCenterAPI, ServiceCenterResponse } from '@/lib/api/serviceCenters';
import {
  serviceBookingAPI,
  AdminServiceBookingItem,
  AdminServiceBookingDetail,
  ServiceBookingStatus,
  CreateServiceBookingPayload,
} from '@/lib/api/serviceBookings';

export function useDealerServices() {
  const { user } = useAuth();

  // Dealer and Service Center state
  const [dealerId, setDealerId] = useState<number | null>(null);
  const [dealerName, setDealerName] = useState<string>('');
  const [serviceCenter, setServiceCenter] = useState<any | null>(null);
  const [serviceCenterId, setServiceCenterId] = useState<number | null>(null);

  // Bookings and Pagination state
  const [bookings, setBookings] = useState<AdminServiceBookingItem[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  }>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
  });

  // UI / Async states
  const [loadingDealer, setLoadingDealer] = useState<boolean>(true);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'preferredDate'>('createdAt');

  // 1. Resolve Dealer & Service Center
  useEffect(() => {
    let isMounted = true;

    async function resolveDealerAndCenter() {
      if (!user?.id) {
        if (isMounted) setLoadingDealer(false);
        return;
      }

      setLoadingDealer(true);
      setError(null);

      try {
        let dId: number | null = user?.dealer?.id || null;
        let dName: string = user?.dealer?.businessName || '';

        if (!dId && user?.id) {
          const res = await dealerAPI.getAllDealers({ limit: 100 });
          if (res.success && res.data?.data) {
            const matched = res.data.data.find((d) => d.userId === user.id);
            if (matched) {
              dId = matched.id;
              dName = matched.businessName;
            } else if (
              user?.role?.name?.toUpperCase() === 'ADMIN' ||
              user?.role?.name?.toUpperCase() === 'SUPER_ADMIN'
            ) {
              const primary =
                res.data.data.find((d) => d.verificationStatus === 'VERIFIED') || res.data.data[0];
              if (primary) {
                dId = primary.id;
                dName = primary.businessName;
              }
            }
          }
        }

        if (!dId) {
          if (isMounted) {
            setError('No dealership profile found linked to your account.');
            setLoadingDealer(false);
          }
          return;
        }

        if (isMounted) {
          setDealerId(dId);
          setDealerName(dName);
        }

        // Fetch dealer's service center
        try {
          const scRes = await serviceCenterAPI.getServiceCenterByDealer(dId);
          if (scRes.success && scRes.data) {
            if (isMounted) {
              const scData: any = scRes.data;
              setServiceCenter(scData);
              const scId = scData.serviceCenterId || scData.id;
              setServiceCenterId(scId);
            }
          }
        } catch (scErr: any) {
          if (isMounted) {
            setServiceCenter(null);
            setServiceCenterId(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to resolve dealer profile:', err);
          setError(err?.response?.data?.message || 'Failed to identify dealer profile.');
        }
      } finally {
        if (isMounted) {
          setLoadingDealer(false);
        }
      }
    }

    resolveDealerAndCenter();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Fetch Bookings for this Service Center
  const fetchBookings = useCallback(async () => {
    if (!serviceCenterId) return;

    setLoadingBookings(true);
    setError(null);

    try {
      const res = await serviceBookingAPI.getAdminBookings(serviceCenterId, {
        page,
        limit: 20,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        sortBy,
      });

      if (res.success && res.data) {
        setBookings(res.data.bookings || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch service bookings:', err);
      setError(err?.response?.data?.message || 'Failed to fetch customer service bookings.');
    } finally {
      setLoadingBookings(false);
    }
  }, [serviceCenterId, page, statusFilter, sortBy]);

  useEffect(() => {
    if (serviceCenterId) {
      fetchBookings();
    }
  }, [serviceCenterId, fetchBookings]);

  // 3. Update Booking Status
  const updateStatus = async (
    bookingId: number,
    newStatus: ServiceBookingStatus,
    notes?: string
  ) => {
    if (!serviceCenterId) return { success: false, message: 'Service Center not identified' };

    setIsUpdating(true);
    try {
      const res = await serviceBookingAPI.updateBookingStatus(serviceCenterId, bookingId, {
        status: newStatus,
        notes,
      });
      if (res.success) {
        await fetchBookings();
        return { success: true, message: res.message || 'Status updated successfully' };
      }
      return { success: false, message: res.message || 'Failed to update status' };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update booking status';
      return { success: false, message: msg };
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Cancel Booking
  const cancelBooking = async (bookingId: number, cancellationReason?: string) => {
    if (!serviceCenterId) return { success: false, message: 'Service Center not identified' };

    setIsUpdating(true);
    try {
      const validReason = cancellationReason?.trim()
        ? cancellationReason.trim().length >= 10
          ? cancellationReason.trim()
          : `${cancellationReason.trim()} (Cancelled by service center)`
        : undefined;
      const res = await serviceBookingAPI.cancelBooking(
        serviceCenterId,
        bookingId,
        validReason
      );
      if (res.success) {
        await fetchBookings();
        return { success: true, message: res.message || 'Booking cancelled successfully' };
      }
      return { success: false, message: res.message || 'Failed to cancel booking' };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to cancel booking';
      return { success: false, message: msg };
    } finally {
      setIsUpdating(false);
    }
  };

  // 5. Create Booking
  const createBooking = async (payload: CreateServiceBookingPayload) => {
    if (!serviceCenterId) return { success: false, message: 'Service Center not identified' };

    setIsCreating(true);
    try {
      const res = await serviceBookingAPI.createBooking(serviceCenterId, payload);
      if (res.success) {
        await fetchBookings();
        return { success: true, message: res.message || 'Service booking created successfully' };
      }
      return { success: false, message: res.message || 'Failed to create booking' };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create service booking';
      return { success: false, message: msg };
    } finally {
      setIsCreating(false);
    }
  };

  // 6. Get Booking Detail
  const getBookingDetail = async (bookingId: number): Promise<AdminServiceBookingDetail | null> => {
    if (!serviceCenterId) return null;
    try {
      const res = await serviceBookingAPI.getAdminBookingDetail(serviceCenterId, bookingId);
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to get booking detail:', err);
      return null;
    }
  };

  return {
    dealerId,
    dealerName,
    serviceCenter,
    serviceCenterId,
    bookings,
    pagination,
    loadingDealer,
    loadingBookings,
    isUpdating,
    isCreating,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    sortBy,
    setSortBy,
    refetch: fetchBookings,
    updateStatus,
    cancelBooking,
    createBooking,
    getBookingDetail,
  };
}
