export const walletState = {
  summary: {
    total_cod_received: 0,
    total_commission: 0
  },

  settings: {},

  restaurants: [],
  riders: [],

  selectedRestaurant: null,
  selectedRider: null,

  activeType: null,
  loading: false
};

export function resetWalletState() {
  walletState.selectedRestaurant = null;
  walletState.selectedRider = null;
  walletState.activeType = null;
}
