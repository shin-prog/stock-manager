# Plan: Home Stock Manager

## TL;DR

> **Quick Summary**: A personal Web App (PWA) to track home inventory, purchase history, and price comparison. Built with Next.js App Router and Supabase.
> 
> **Deliverables**:
> - Supabase Database (Products, Purchases, Stock, Units)
> - Next.js PWA (Purchase Log, Inventory List, Price History)
> - "Quick Decrement" & "Re-buy" features for low-friction management
> 
> **Estimated Effort**: Medium (due to unit conversion logic)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: DB Schema → Purchase Log UI → Inventory Logic

---

## Context

### Original Request
User wants to solve:
- "Do I have this?" (Existence)
- "How many left?" (Quantity)
- "Where is it cheapest?" (Price Comparison)
- "When/Where did I buy it?" (History)
- Supports categories (Bath, Cleaning, etc.) and Consumables.

### Interview Summary
**Key Decisions**:
- **Platform**: Web App / PWA (Next.js + Supabase).
- **Input**: Manual Entry (focused on speed/low friction).
- **User**: Personal use only (simple/no auth required initially, or basic RLS).
- **Data Strategy**: Supabase for relational data (Price History needs relational integrity).

**Research Findings**:
- **Schema**: Needs `product_units` to handle "Pack of 6" vs "1 bottle".
- **Friction**: Manual entry is hard. "Re-buy" (copy previous purchase) is essential.
- **Stock Logic**: "Snapshot" checks (audit) + Quick Decrement (-1) is better than logging every consumption.

### Metis Review
**Identified Gaps** (addressed):
- **Stock Decrement**: Added `stock_adjustments` table and UI for "Quick Use" (-1).
- **Unit Math**: Added explicit `factor_to_base` logic to handle "Buy in Box, Use in Piece".
- **Price Comparison**: Logic defined as "Price per Base Unit" (e.g., price/ml).

---

## Work Objectives

### Core Objective
Build a friction-reduced inventory system that answers "How much?" and "Cheapest store?"

### Concrete Deliverables
- **Database**: Supabase migrations for 6 tables.
- **App**: Next.js 14+ App Router project.
- **Features**:
  - Purchase Log (Add items + Price)
  - Inventory Dashboard (Current counts)
  - Price History View (Chart/List of past prices)
  - Settings (Manage Products/Units/Stores)

### Definition of Done
- [ ] User can add a purchase of "Milk" at "Store A" for "200 yen".
- [ ] System calculates unit price and updates stock count.
- [ ] User can see "Milk" stock is "1".
- [ ] User can click "-1" to reduce stock.
- [ ] Price history shows "Store A: 200 yen".

### Must Have
- **Unit Conversion**: Handle "Case of 24" vs "Single".
- **Price per Unit**: Calculate "Yen per ml" or "Yen per gram".
- **Mobile Mobile**: UI must be touch-friendly (large buttons).

### Must NOT Have (Guardrails)
- **Complex Auth**: No multi-tenant SaaS features. Single user RLS.
- **Barcode Scanning**: Postponed to V2 (Manual entry focused for now).
- **Receipt OCR**: Out of scope.

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
> ALL verification is executed by the agent via Playwright (UI) or SQL/Bash (Logic).

### Test Decision
- **Infrastructure exists**: NO (New project).
- **Automated tests**: YES (TDD for logic, Playwright for UI).
- **Framework**: Vitest (Unit) + Playwright (E2E).

### Agent-Executed QA Scenarios

**1. Unit Conversion Logic (Vitest)**
```
Scenario: Buy Pack of 6, Stock increases by 6
  Tool: Bash (vitest)
  Preconditions: Product "Coke" (base: can), Unit "6-Pack" (factor: 6)
  Steps:
    1. Call logic: buyProduct(cokeId, quantity: 1, unit: sixPackId)
    2. Assert: Stock count increases by 6
  Expected Result: Math is correct
```

**2. Purchase Log Flow (Playwright)**
```
Scenario: Log a purchase and verify stock update
  Tool: Playwright
  Preconditions: App running, Database seeded
  Steps:
    1. Go to /add-purchase
    2. Select "Milk", Store "Super A", Price "200"
    3. Click "Save"
    4. Go to /inventory
    5. Assert: "Milk" count is 1 (or +1)
  Evidence: .sisyphus/evidence/purchase-flow.png
```

**3. Price Comparison (SQL/Logic)**
```
Scenario: Identify cheapest store
  Tool: Bash (TS script)
  Preconditions: DB has purchases: Store A ($10/1kg), Store B ($6/500g)
  Steps:
    1. Run query: getCheapestStore(productId)
    2. Assert: Result is "Store A" ($0.01/g vs $0.012/g)
  Expected Result: Correctly normalizes units for price comparison
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Setup & Schema):
├── Task 1: Project Setup (Next.js + Supabase)
└── Task 2: Database Schema & Migrations

Wave 2 (Core Logic & UI):
├── Task 3: Unit Conversion Logic (TDD)
├── Task 4: Master Data UI (Products/Stores)
└── Task 5: Purchase Log UI

Wave 3 (Integration):
├── Task 6: Inventory Dashboard (Stock View)
└── Task 7: Price History & Analytics
```

---

## TODOs

- [ ] 1. Project Initialization & Supabase Setup
  **What to do**:
  - Initialize Next.js 14 (App Router) project.
  - Setup Supabase project (local or cloud).
  - Configure Tailwind + Shadcn/UI.
  **Recommended Agent**: `task(category="quick", load_skills=["frontend-ui-ux"])`
  **Parallelization**: Wave 1

- [ ] 2. Database Schema Implementation
  **What to do**:
  - Create tables: `products`, `units`, `product_units`, `stores`, `purchases`, `purchase_lines`, `stock`.
  - Add RLS policies (even for single user, best practice).
  - Seed basic units (ml, g, kg, l, piece).
  **References**:
  - `schema-concept`: Use the 6-table schema from research.
  **Recommended Agent**: `task(category="ultrabrain", load_skills=["git-master"])`
  **Parallelization**: Wave 1

- [ ] 3. Unit Conversion & Stock Logic (TDD)
  **What to do**:
  - Implement `calculateStock(productId)`: Sum(Purchases) - Sum(Adjustments).
  - Implement `normalizePrice(price, unit)`: Return price per base unit.
  - **TDD First**: Write tests in `src/lib/logic.test.ts`.
  **Recommended Agent**: `task(category="ultrabrain", load_skills=[])`
  **Parallelization**: Wave 2

- [ ] 4. Master Data Management UI
  **What to do**:
  - Pages to CRUD Products, Stores, and Units.
  - "Product" form must allow defining "allowed units" (e.g., Coke can be bought in 'Can' or '6-Pack').
  **Recommended Agent**: `task(category="visual-engineering", load_skills=["frontend-ui-ux"])`
  **Parallelization**: Wave 2

- [ ] 5. Purchase Log UI (Manual Entry)
  **What to do**:
  - Form to record new purchases.
  - Features: Date picker, Store select, Product select (combobox).
  - **Key**: "Re-buy" button (load last purchase defaults).
  **Recommended Agent**: `task(category="visual-engineering", load_skills=["frontend-ui-ux"])`
  **Parallelization**: Wave 2

- [ ] 6. Inventory Dashboard
  **What to do**:
  - View current stock counts.
  - **Quick Action**: "-1" button (consume) and "+1" button (adjust).
  - Visual indicator for low stock (optional).
  **Recommended Agent**: `task(category="visual-engineering", load_skills=["frontend-ui-ux"])`
  **Parallelization**: Wave 3

- [ ] 7. Price History View
  **What to do**:
  - Component showing "Last Price" vs "Lowest Price".
  - Chart or list of past purchases for a selected product.
  - Highlight "Best Store" based on normalized unit price.
  **Recommended Agent**: `task(category="visual-engineering", load_skills=["frontend-ui-ux"])`
  **Parallelization**: Wave 3

---

## Success Criteria

### Final Checklist
- [ ] Can record a purchase of a multi-pack item.
- [ ] Stock count updates correctly based on pack size.
- [ ] Can identify the cheapest store for a product.
- [ ] UI works on mobile (responsive).
- [ ] All Vitest tests pass.
