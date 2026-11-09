import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  setStepData,
  nextStep,
  prevStep,
  setCurrentStep,
  submitOnboarding,
  resetOnboarding,
  setIsVendor,
  setApprovalStatus,
} from "../store/slices/sellerSlice";
import type { StoreOnboardingData } from "../store/slices/sellerSlice";

export function useStoreOnboarding() {
  const dispatch = useDispatch<AppDispatch>();

  const onboardingData = useSelector((state: RootState) => state.seller.onboardingData);
  const currentStep = useSelector((state: RootState) => state.seller.currentStep);
  const submitted = useSelector((state: RootState) => state.seller.submitted);
  const approvalStatus = useSelector((state: RootState) => state.seller.approvalStatus);
  const isVendor = useSelector((state: RootState) => state.seller.isVendor);

  const updateStepData = (data: Partial<StoreOnboardingData>) => {
    dispatch(setStepData(data));
  };

  const goToNextStep = () => {
    dispatch(nextStep());
  };

  const goToPrevStep = () => {
    dispatch(prevStep());
  };

  const goToStep = (step: number) => {
    dispatch(setCurrentStep(step));
  };

  const submit = () => {
    dispatch(submitOnboarding());
  };

  const reset = () => {
    dispatch(resetOnboarding());
  };

  const updateVendorStatus = (vendor: boolean) => {
    dispatch(setIsVendor(vendor));
  };

  const updateApprovalStatus = (status: "pending" | "approved" | "rejected" | null) => {
    dispatch(setApprovalStatus(status));
  };

  return {
    onboardingData,
    currentStep,
    submitted,
    approvalStatus,
    isVendor,
    updateStepData,
    goToNextStep,
    goToPrevStep,
    goToStep,
    submit,
    reset,
    updateVendorStatus,
    updateApprovalStatus,
  };
}