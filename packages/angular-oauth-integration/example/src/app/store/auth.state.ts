export interface AuthState {
  userData: any | null;
  tokenData: any | null;
  configuration: any | null;
  authResult: any | null;
  isUserDataLoading: boolean;
  isTokenRefreshing: boolean;
  isAuthLoading: boolean;
  isTimeoutReason: boolean;
  error: any | null;
}

export const initialAuthState: AuthState = {
  userData: null,
  tokenData: null,
  configuration: null,
  authResult: null,
  isUserDataLoading: false,
  isTokenRefreshing: false,
  isAuthLoading: false,
  isTimeoutReason: false,
  error: null
};