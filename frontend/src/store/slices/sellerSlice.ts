import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface StoreOnboardingData {
  // Step 1: Account Info
  email: string;
  name: string;
  phone: string;
  // Step 2: Store Details
  storeName: string;
  storeDescription: string;
  storeLogo: string | null;
  storeCategory: string;
  returnPolicy: string;
  shippingPolicy: string;
  // Step 3: Review (no additional fields)
}

export interface SellerState {
  onboardingData: StoreOnboardingData;
  currentStep: number;
  submitted: boolean;
  approvalStatus: "pending" | "approved" | "rejected" | null;
  isVendor: boolean;
}

const initialOnboardingData: StoreOnboardingData = {
  email: "",
  name: "",
  phone: "",
  storeName: "",
  storeDescription: "",
  storeLogo: null,
  storeCategory: "",
  returnPolicy: "",
  shippingPolicy: "",
};

const initialState: SellerState = {
  onboardingData: initialOnboardingData,
  currentStep: 1,
  submitted: false,
  approvalStatus: null,
  isVendor: false,
};

const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {
    setStepData: (state, action: PayloadAction<Partial<StoreOnboardingData>>) => {
      state.onboardingData = { ...state.onboardingData, ...action.payload };
    },
    nextStep: (state) => {
      if (state.currentStep < 3) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = Math.max(1, Math.min(3, action.payload));
    },
    submitOnboarding: (state) => {
      state.submitted = true;
      state.approvalStatus = "pending";
    },
    resetOnboarding: (state) => {
      state.onboardingData = initialOnboardingData;
      state.currentStep = 1;
      state.submitted = false;
      state.approvalStatus = null;
    },
    setIsVendor: (state, action: PayloadAction<boolean>) => {
      state.isVendor = action.payload;
    },
    setApprovalStatus: (state, action: PayloadAction<"pending" | "approved" | "rejected" | null>) => {
      state.approvalStatus = action.payload;
    },
  },
});

export const {
  setStepData,
  nextStep,
  prevStep,
  setCurrentStep,
  submitOnboarding,
  resetOnboarding,
  setIsVendor,
  setApprovalStatus,
} = sellerSlice.actions;

export const selectOnboardingData = (state: { seller: SellerState }) => state.seller.onboardingData;
export const selectCurrentStep = (state: { seller: SellerState }) => state.seller.currentStep;
export const selectIsSubmitted = (state: { seller: SellerState }) => state.seller.submitted;
export const selectApprovalStatus = (state: { seller: SellerState }) => state.seller.approvalStatus;
export const selectIsVendor = (state: { seller: SellerState }) => state.seller.isVendor;

export default sellerSlice.reducer;