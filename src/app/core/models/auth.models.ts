// Matches RegisterDto.cs
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/*
VIMP
 Jitne Bhi models he voh API ke based par banaye he kyuki at the end 'Response' API se milega
*/

// Matches LoginDto.cs
export interface LoginRequest {
  email: string;
  password: string;
}

// Matches UserResponseDto.cs
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  role: string;
}

// Matches LoginResponseDto.cs
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}