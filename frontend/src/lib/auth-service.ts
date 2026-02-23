const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
  login: async (data: LoginFormData) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  verify2FA: async (code: string) => {
    // ... implementation
  }
};