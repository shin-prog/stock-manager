import { describe, it, expect } from 'vitest';
import { calculateStock, normalizePrice } from './logic';
import { PurchaseLine, StockAdjustment, ProductUnit } from '@/types';

describe('Stock Logic', () => {
  const baseUnitId = 'base-unit-id';
  const packUnitId = 'pack-unit-id'; // 6 pack
  const caseUnitId = 'case-unit-id'; // 24 case

  const productUnits: ProductUnit[] = [
    { id: '1', unit_id: baseUnitId, factor_to_base: 1, is_default: true },
    { id: '2', unit_id: packUnitId, factor_to_base: 6, is_default: false },
    { id: '3', unit_id: caseUnitId, factor_to_base: 24, is_default: false },
  ];

  describe('calculateStock', () => {
    it('should calculate initial stock from single unit purchase', () => {
      const purchases: PurchaseLine[] = [
        { id: 'p1', product_id: 'prod1', unit_id: baseUnitId, quantity: 10, unit_price: 100 }
      ];
      const adjustments: StockAdjustment[] = [];
      
      const stock = calculateStock(purchases, adjustments, productUnits);
      expect(stock).toBe(10);
    });

    it('should calculate stock with unit conversion (Pack of 6)', () => {
      const purchases: PurchaseLine[] = [
        { id: 'p1', product_id: 'prod1', unit_id: packUnitId, quantity: 2, unit_price: 500 } // 2 packs of 6 = 12
      ];
      const adjustments: StockAdjustment[] = [];
      
      const stock = calculateStock(purchases, adjustments, productUnits);
      expect(stock).toBe(12);
    });

    it('should subtract adjustments from stock', () => {
      const purchases: PurchaseLine[] = [
        { id: 'p1', product_id: 'prod1', unit_id: baseUnitId, quantity: 10, unit_price: 100 }
      ];
      const adjustments: StockAdjustment[] = [
        { id: 'a1', product_id: 'prod1', change_amount: -3 } // Consumed 3
      ];
      
      const stock = calculateStock(purchases, adjustments, productUnits);
      expect(stock).toBe(7);
    });

    it('should handle mixed unit purchases', () => {
      const purchases: PurchaseLine[] = [
        { id: 'p1', product_id: 'prod1', unit_id: baseUnitId, quantity: 5, unit_price: 100 },
        { id: 'p2', product_id: 'prod1', unit_id: packUnitId, quantity: 1, unit_price: 500 } // +6
      ];
      // Total should be 5 + 6 = 11
      const stock = calculateStock(purchases, [], productUnits);
      expect(stock).toBe(11);
    });
  });

  describe('normalizePrice', () => {
    it('should return same price for base unit', () => {
      const price = normalizePrice(100, baseUnitId, productUnits);
      expect(price).toBe(100);
    });

    it('should normalize pack price to base unit price', () => {
      // Pack of 6 costs 600 -> 1 unit costs 100
      const price = normalizePrice(600, packUnitId, productUnits);
      expect(price).toBe(100);
    });

    it('should handle case conversion', () => {
      // Case of 24 costs 2400 -> 1 unit costs 100
      const price = normalizePrice(2400, caseUnitId, productUnits);
      expect(price).toBe(100);
    });
  });
});
