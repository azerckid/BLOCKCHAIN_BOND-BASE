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

### Phase 1: Diagnostics & Parallelization (Immediate)
- [ ] Audit `portfolio.tsx` loader for waterfalls.
- [ ] Audit `bonds.tsx` loader for waterfalls.
- [ ] Audit `home.tsx` loader for waterfalls.
- [ ] Refactor sequential `await` calls to `Promise.all` patterns.

### Phase 2: Bundle Optimization (Next)
- [ ] Analyze bundle composition using appropriate visualization tools if available.
- [ ] Identify large dependencies (e.g., specific chart libraries).
- [ ] Apply Code Splitting for the heaviest routes.

### Phase 3: UX & Rendering (Future)
- [ ] Implement `React.memo` for high-frequency re-rendering components (if actual lag is observed).
- [ ] Verify "Cumulative Layout Shift (CLS)" is near zero by adding proper dimensions to images and charts.

## 5. Verification
After applying changes, verification will be done by:
1.  **Code Review**: Checking against the official Vercel/React patterns.
2.  **User Interaction**: Manually verifying that pages load feels "snappier" and data appears consistently.
