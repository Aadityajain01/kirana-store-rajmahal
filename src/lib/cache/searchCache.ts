export interface CachedCustomer {
  id: string;
  name: string;
  mobile?: string | null;
  currentBalancePaise?: number | string | bigint;
}

export interface CachedProduct {
  id: string;
  name: string;
  unitType: string; // KG, PCS, LTR, PKT, DOZEN, MANUAL
}

export interface CachedSupplier {
  id: string;
  name: string;
  mobile?: string | null;
  currentBalancePaise?: number | string | bigint;
}

class SearchCacheManager {
  private customers: CachedCustomer[] = [];
  private products: CachedProduct[] = [];
  private suppliers: CachedSupplier[] = [];
  private lastFetched: { [key: string]: number } = {};
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh in-memory TTL

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const c = localStorage.getItem('kirana_cached_customers');
      if (c) this.customers = JSON.parse(c);

      const p = localStorage.getItem('kirana_cached_products');
      if (p) this.products = JSON.parse(p);

      const s = localStorage.getItem('kirana_cached_suppliers');
      if (s) this.suppliers = JSON.parse(s);
    } catch {
      // Ignore localStorage errors
    }
  }

  private saveToStorage(key: 'customers' | 'products' | 'suppliers') {
    if (typeof window === 'undefined') return;
    try {
      if (key === 'customers') {
        localStorage.setItem('kirana_cached_customers', JSON.stringify(this.customers.slice(0, 1000)));
      } else if (key === 'products') {
        localStorage.setItem('kirana_cached_products', JSON.stringify(this.products.slice(0, 1000)));
      } else if (key === 'suppliers') {
        localStorage.setItem('kirana_cached_suppliers', JSON.stringify(this.suppliers.slice(0, 500)));
      }
    } catch {
      // Storage quota or error safe
    }
  }

  // --- Customers ---
  public async getCustomers(force = false): Promise<CachedCustomer[]> {
    const now = Date.now();
    if (!force && this.customers.length > 0 && now - (this.lastFetched['customers'] || 0) < this.CACHE_TTL_MS) {
      return this.customers;
    }

    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        this.customers = data.customers || [];
        this.lastFetched['customers'] = now;
        this.saveToStorage('customers');
      }
    } catch {
      // Return existing cache if offline
    }
    return this.customers;
  }

  public searchCustomers(query: string): CachedCustomer[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.customers.slice(0, 15);

    return this.customers
      .filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(q);
        const mobileMatch = c.mobile && c.mobile.includes(q);
        return nameMatch || mobileMatch;
      })
      .slice(0, 15);
  }

  public addOrUpdateCustomer(customer: CachedCustomer) {
    const idx = this.customers.findIndex((c) => c.id === customer.id || c.name.toLowerCase() === customer.name.toLowerCase());
    if (idx >= 0) {
      this.customers[idx] = { ...this.customers[idx], ...customer };
    } else {
      this.customers.unshift(customer);
    }
    this.saveToStorage('customers');
  }

  // --- Products ---
  public async getProducts(force = false): Promise<CachedProduct[]> {
    const now = Date.now();
    if (!force && this.products.length > 0 && now - (this.lastFetched['products'] || 0) < this.CACHE_TTL_MS) {
      return this.products;
    }

    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        this.products = data.products || [];
        this.lastFetched['products'] = now;
        this.saveToStorage('products');
      }
    } catch {
      // Return existing
    }
    return this.products;
  }

  public searchProducts(query: string): CachedProduct[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.products.slice(0, 15);

    return this.products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 15);
  }

  public addOrUpdateProduct(product: CachedProduct) {
    const idx = this.products.findIndex((p) => p.id === product.id || p.name.toLowerCase() === product.name.toLowerCase());
    if (idx >= 0) {
      this.products[idx] = { ...this.products[idx], ...product };
    } else {
      this.products.unshift(product);
    }
    this.saveToStorage('products');
  }

  // --- Suppliers ---
  public async getSuppliers(force = false): Promise<CachedSupplier[]> {
    const now = Date.now();
    if (!force && this.suppliers.length > 0 && now - (this.lastFetched['suppliers'] || 0) < this.CACHE_TTL_MS) {
      return this.suppliers;
    }

    try {
      const res = await fetch('/api/suppliers');
      if (res.ok) {
        const data = await res.json();
        this.suppliers = data.suppliers || [];
        this.lastFetched['suppliers'] = now;
        this.saveToStorage('suppliers');
      }
    } catch {
      // Return existing
    }
    return this.suppliers;
  }

  public searchSuppliers(query: string): CachedSupplier[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.suppliers.slice(0, 15);

    return this.suppliers
      .filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(q);
        const mobileMatch = s.mobile && s.mobile.includes(q);
        return nameMatch || mobileMatch;
      })
      .slice(0, 15);
  }

  public addOrUpdateSupplier(supplier: CachedSupplier) {
    const idx = this.suppliers.findIndex((s) => s.id === supplier.id || s.name.toLowerCase() === supplier.name.toLowerCase());
    if (idx >= 0) {
      this.suppliers[idx] = { ...this.suppliers[idx], ...supplier };
    } else {
      this.suppliers.unshift(supplier);
    }
    this.saveToStorage('suppliers');
  }
}

export const searchCache = new SearchCacheManager();
