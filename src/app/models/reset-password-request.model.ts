// src/app/models/reset-password-request.model.ts
// Corresponde ao ResetPasswordRequest.java no backend
export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}
