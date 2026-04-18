// lib/guestStorage.ts

export interface GuestCartItem {
  id: number;           // same as product_id (used as row id for guest)
  product_id: number;
  format: "ebook" | "paperback";
  quantity: number;
  title: string;
  slug: string;
  main_image: string;
  price: number;
  sell_price: number;
  ebook_price: number | null;
  ebook_sell_price: number | null;
  stock: number;
  product_type: "physical" | "ebook" | "both";
}

export interface GuestWishlistItem {
  id: number;
  title: string;
  slug: string;
  main_image: string;
  price: number;
  sell_price: number;
  ebook_price: number | null;
  ebook_sell_price: number | null;
  stock: number;
  product_type: "physical" | "ebook" | "both";
  created_at: string;
}

const CART_KEY = "guest_cart";
const WISH_KEY = "guest_wishlist";

const safe = <T>(fn: () => T, fallback: T): T => {
  try { return fn(); } catch { return fallback; }
};

export const guestCart = {
  get: (): GuestCartItem[] =>
    safe(() => JSON.parse(localStorage.getItem(CART_KEY) || "[]"), []),

  add: (item: GuestCartItem): void => {
    const cart = guestCart.get();
    const idx  = cart.findIndex(
      i => i.product_id === item.product_id && i.format === item.format
    );
    if (idx >= 0) {
      const cap = item.format === "paperback" ? (item.stock || 99) : 1;
      cart[idx].quantity = Math.min(cart[idx].quantity + 1, cap);
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  remove: (product_id: number, format: string): void => {
    const cart = guestCart.get().filter(
      i => !(i.product_id === product_id && i.format === format)
    );
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  removeById: (id: number): void => {
    const cart = guestCart.get().filter(i => i.id !== id);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  updateQty: (product_id: number, format: string, quantity: number): void => {
    const cart = guestCart.get();
    const idx  = cart.findIndex(
      i => i.product_id === product_id && i.format === format
    );
    if (idx < 0) return;
    if (quantity <= 0) cart.splice(idx, 1);
    else cart[idx].quantity = quantity;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  clear: (): void => localStorage.removeItem(CART_KEY),

  count: (): number => guestCart.get().reduce((s, i) => s + i.quantity, 0),
};

export const guestWishlist = {
  get: (): GuestWishlistItem[] =>
    safe(() => JSON.parse(localStorage.getItem(WISH_KEY) || "[]"), []),

  getIds: (): number[] => guestWishlist.get().map(i => i.id),

  has: (id: number): boolean => guestWishlist.get().some(i => i.id === id),

  add: (item: GuestWishlistItem): void => {
    const list = guestWishlist.get();
    if (!list.find(i => i.id === item.id)) {
      list.push(item);
      localStorage.setItem(WISH_KEY, JSON.stringify(list));
    }
  },

  remove: (id: number): void => {
    const list = guestWishlist.get().filter(i => i.id !== id);
    localStorage.setItem(WISH_KEY, JSON.stringify(list));
  },

  clear: (): void => localStorage.removeItem(WISH_KEY),
};

export async function syncGuestDataAfterLogin(token: string) {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  for (const item of guestCart.get()) {
    await fetch(`${API}/api/ag-classics/cart`, {
      method: "POST", headers,
      body: JSON.stringify({ product_id: item.product_id, format: item.format, quantity: item.quantity }),
    }).catch(() => {});
  }
  guestCart.clear();

  for (const item of guestWishlist.get()) {
    await fetch(`${API}/api/ag-classics/wishlist`, {
      method: "POST", headers,
      body: JSON.stringify({ product_id: item.id }),
    }).catch(() => {});
  }
  guestWishlist.clear();

  window.dispatchEvent(new Event("cart-change"));
  window.dispatchEvent(new Event("wishlist-change"));
}