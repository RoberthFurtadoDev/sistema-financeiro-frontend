// src/app/models/change-password-request.model.ts
// Corresponde ao ChangePasswordRequest.java no backend
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}
