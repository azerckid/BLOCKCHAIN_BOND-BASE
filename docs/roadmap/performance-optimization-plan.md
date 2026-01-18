# Performance Optimization Plan

## 1. Objective
Establish a high-performance frontend architecture for BuildCTC (BondBase) by adopting Vercel's engineering best practices. The primary goal is to minimize latency, reduce bundle size, and ensure immediate interactivity for users, directly impacting user conversion and retention.

## 2. Core Principles (Based on 'vercel-react-best-practices')
1.  **Eliminate Waterfalls**: Data fetching must occur in parallel wherever possible. Sequential `await` chains in `loader` functions are strictly prohibited unless one request depends on the data of another.
2.  **Zero Bundle Bloat**: Code split heavy components and libraries. Ensure "barrel files" do not leak unused code into client bundles.
3.  **Server-Centric**: Move logic to the server. Prefer `loader` data transformation over client-side processing to reduce main thread blocking.
4.  **Instant Feedback**: Use Optimistic UI updates and Suspense streaming to make the app feel responsive even while loading.

## 3. Targeted Areas for Optimization

### A. Data Fetching (Critical)
*   **Target Pages**: `portfolio.tsx`, `home.tsx`, `bonds.tsx`
*   **Current Issue (Hypothetical)**: Sequential fetching of user profile -> balance -> asset history.
*   **Solution**: Implement `Promise.all()` to fetch all independent data concurrently.
*   **Metric**: Reduce Time to First Byte (TTFB) and Total Blocking Time (TBT).

### B. Route-Based Code Splitting
*   **Target**: Routes with heavy UI dependencies (e.g., Charting libraries in `portfolio.tsx`, Maps in `impact.tsx`).
*   **Solution**: Use `React.lazy` and `Suspense` (or Next.js/React Router specific lazy loading patterns) to load these components only when needed.

### C. Resource Optimization
*   **Target**: Static assets (images, icons).
*   **Solution**: Ensure proper format (WebP/AVIF) and sizing. Use skeleton loaders instead of blank screens.

## 4. Execution Roadmap

### Phase 1: Diagnostics & Parallelization (Completed ✅)
- [x] Audit `portfolio.tsx` loader for waterfalls.
- [x] Audit `bonds.tsx` loader for waterfalls.
- [x] Audit `home.tsx` loader for waterfalls.
- [x] Refactor sequential `await` calls to `Promise.all` patterns.
- [x] **Result**: Implemented Lazy Loading & Skeleton UI in `portfolio.tsx` to optimize initial bundle size.

### Phase 2: Bundle Optimization & Resource Diet (Completed ✅)
- [x] Analyze bundle composition using appropriate visualization tools.
- [x] Identify large dependencies (Removed unused imports from `hugeicons` and `vis.gl`).
- [x] Apply Code Splitting for the heaviest routes (`ApplicationChart`, `PerformanceChart`).
- [x] **Result**: Clean build with zero warnings and reduced chunk sizes.

### Phase 3: UX & Rendering (Standby ⏸️)
- [ ] Implement `React.memo` for high-frequency re-rendering components (Current re-renders are negligible).
- [x] Verify "Cumulative Layout Shift (CLS)" is near zero by adding proper dimensions to images and charts. (Verified with Skeleton UI)
- [ ] **Status**: Postponed until feature complexity warrants further rendering optimization. Current performance is sufficient.

## 5. Verification
After applying changes, verification will be done by:
1.  **Code Review**: Checked against the official 'vercel-react-best-practices' skill.
2.  **User Interaction**: Confirmed snappy load times and smooth transitions in Portfolio/Bonds pages.
3.  **Build Check**: `npm run build` completed successfully without warnings.
