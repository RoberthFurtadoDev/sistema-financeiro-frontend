// src/app/models/user.model.ts
// Corresponde ao UserDto.java no backend
export interface User {
  id?: number;
  username: string; // Nome de exibição
  email: string;
  // Não incluir password aqui por segurança
}
