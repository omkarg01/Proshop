# RestockDashboard Component

## Overview
The `RestockDashboard` component is an admin-focused modal dashboard that displays top-rated products needing restocking. It follows the same code pattern as `SmartProductCard.tsx` with Zod schema validation and Tambo integration.

## Features

### 📊 Dashboard Statistics
- **Total Products**: Count of products needing restock
- **Average Rating**: Mean rating of all products in the dashboard
- **Stock Value**: Total monetary value of current stock
- **Critical Stock**: Number of products with ≤5 units (urgent priority)

### 📋 Product Table
Displays detailed information for each product:
- Product image (50x50px thumbnail)
- Product name and ID
- Category badge
- Brand
- Price
- Rating with review count
- Stock level with color-coded badges
- Stock value (price × quantity)
- Priority indicator (URGENT for ≤5 units, Medium for 6-10 units)

## Props Schema

```typescript
{
  minRating: number (optional, default: 4.0)
  maxStockLevel: number (optional, default: 10)
  category: string (optional)
  autoOpen: boolean (optional, default: true)
}
```

## Usage in Chat Interface

### Example Admin Queries:
1. **"Show me top-rated products that need restocking"**
   - Opens dashboard with default settings (rating ≥4.0, stock ≤10)

2. **"Show restock dashboard for Electronics category"**
   - Opens dashboard filtered to Electronics category

3. **"Show products with rating above 4.5 and stock below 5"**
   - Opens dashboard with custom thresholds

## Component Registration

The component is registered in `tambo.ts`:

```typescript
{
  name: "RestockDashboard",
  description: "Admin dashboard modal displaying top-rated products that need restocking...",
  component: RestockDashboard,
  propsSchema: RestockDashboardPropsSchema,
}
```

## Technical Details

### Data Fetching
- Uses `findTopRatedLowStock` service from `productService.js`
- Fetches data when modal opens
- Calculates statistics client-side

### Styling
- Bootstrap Modal (size: xl, centered)
- Color-coded badges for stock levels:
  - 🔴 Red (danger): ≤5 units
  - 🟡 Yellow (warning): 6-10 units
  - 🟢 Green (success): >10 units
- Sticky table header for scrolling
- Responsive table with horizontal scroll

### State Management
- `show`: Controls modal visibility
- `products`: Array of products needing restock
- `isLoading`: Loading state
- `error`: Error message if fetch fails
- `stats`: Calculated statistics object

## Future Enhancements (Planned)

- [ ] Export to CSV functionality
- [ ] Quick restock actions (update stock directly from dashboard)
- [ ] Charts and graphs (stock trends, category breakdown)
- [ ] Sorting and filtering options
- [ ] Email alerts for critical stock
- [ ] Integration with supplier ordering system
- [ ] Historical restock data
- [ ] Predictive analytics for restock timing

## Files Modified/Created

1. ✅ Created: `frontend/src/components/RestockDashboard.tsx`
2. ✅ Modified: `frontend/src/lib/tambo.ts` (added import and component registration)
