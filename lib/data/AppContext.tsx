'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { FilterState } from '../types';
import { QuickMartData, initialData, fetchAllQuickMartData, computeFilteredMetrics } from './dataProvider';

interface AppContextType {
  data: QuickMartData;
  filters: FilterState;
  updateFilter: (key: keyof FilterState, value: any) => void;
  resetFilters: () => void;
  filteredMetrics: ReturnType<typeof computeFilteredMetrics>;
  loading: boolean;
  validationCheck: {
    passed: boolean;
    differences: string[];
  };
}

export const initialFilterState: FilterState = {
  dateRange: null,
  month: 'all',
  quarter: 'all',
  region: 'all',
  province: 'all',
  store: 'all',
  category: 'all',
  subCategory: 'all',
  product: 'all',
  promotion: 'all',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<QuickMartData>(initialData);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAllQuickMartData()
      .then((loadedData) => {
        setData(loadedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load QuickMart data:', err);
        setLoading(false);
      });
  }, []);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Cascade resets
      if (key === 'region' && value !== 'all') {
        next.province = 'all';
        next.store = 'all';
      }
      if (key === 'category' && value !== 'all') {
        next.subCategory = 'all';
        next.product = 'all';
      }
      if (key === 'quarter' && value !== 'all') {
        next.month = 'all';
      }
      return next;
    });
  };

  const resetFilters = () => {
    setFilters(initialFilterState);
  };

  const filteredMetrics = useMemo(() => {
    if (!data.loaded) {
      return computeFilteredMetrics(initialData, initialFilterState);
    }
    return computeFilteredMetrics(data, filters);
  }, [data, filters]);

  // Validation Check against Locked Phase 4 Baseline
  const validationCheck = useMemo(() => {
    const diffs: string[] = [];
    if (!data.loaded) return { passed: true, differences: [] };

    const expectedSales = 1595166.51;
    const expectedProfit = 499676.51;
    const expectedMargin = 31.32;
    const expectedUnits = 71885;
    const expectedTxns = 26327;
    const expectedCurrentStock = 29796;

    // Check sum of monthly sales
    const actualSales = data.salesByMonth.reduce((a, b) => a + (b.SalesAmount || 0), 0);
    const actualProfit = data.salesByMonth.reduce((a, b) => a + (b.ProfitAmount || 0), 0);
    const actualUnits = data.salesByMonth.reduce((a, b) => a + (b.Quantity || 0), 0);
    const actualStock = data.inventorySnapshot.reduce((a, b) => a + (b.EndingStock || 0), 0);

    if (Math.abs(actualSales - expectedSales) > 1.0) {
      diffs.push(`Sales mismatch: Actual ${actualSales.toFixed(2)} vs Expected ${expectedSales.toFixed(2)}`);
    }
    if (Math.abs(actualProfit - expectedProfit) > 1.0) {
      diffs.push(`Profit mismatch: Actual ${actualProfit.toFixed(2)} vs Expected ${expectedProfit.toFixed(2)}`);
    }
    if (actualUnits !== expectedUnits) {
      diffs.push(`Units mismatch: Actual ${actualUnits} vs Expected ${expectedUnits}`);
    }
    if (actualStock !== expectedCurrentStock) {
      diffs.push(`Current Stock mismatch: Actual ${actualStock} vs Expected ${expectedCurrentStock}`);
    }

    return {
      passed: diffs.length === 0,
      differences: diffs,
    };
  }, [data]);

  return (
    <AppContext.Provider
      value={{
        data,
        filters,
        updateFilter,
        resetFilters,
        filteredMetrics,
        loading,
        validationCheck,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
