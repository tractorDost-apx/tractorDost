export interface CartState {
  itemCount: number;
  lastUpdated: string | null;
}

export const initialCartState: CartState = {
  itemCount: 0,
  lastUpdated: null,
};
