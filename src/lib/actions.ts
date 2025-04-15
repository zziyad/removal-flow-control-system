
import { 
  approveRemoval as apiApproveRemoval, 
  rejectRemoval as apiRejectRemoval,
  submitRemoval as apiSubmitRemoval,
  recordReturn as apiRecordReturn,
  requestExtension as apiRequestExtension,
  approveExtension as apiApproveExtension,
  rejectExtension as apiRejectExtension
} from "./api";

export const approve = async (
  removalId: string, 
  level: number,
  signature: string,
  comments?: string
) => {
  return await apiApproveRemoval(removalId, level, signature, comments);
};

export const reject = async (
  removalId: string, 
  level: number,
  rejectionReason: string,
  signature: string
) => {
  return await apiRejectRemoval(removalId, level, rejectionReason, signature);
};

export const submit = async (removalId: string) => {
  return await apiSubmitRemoval(removalId);
};

export const recordReturn = async (
  removalId: string,
  returnDate: Date,
  condition: string,
  notes?: string
) => {
  return await apiRecordReturn(removalId, returnDate, condition, notes);
};

export const requestExtension = async (
  removalId: string,
  newDate: Date
) => {
  return await apiRequestExtension(removalId, newDate);
};

export const approveExtension = async (
  removalId: string,
  extensionId: string
) => {
  return await apiApproveExtension(removalId, extensionId);
};

export const rejectExtension = async (
  removalId: string,
  extensionId: string
) => {
  return await apiRejectExtension(removalId, extensionId);
};
