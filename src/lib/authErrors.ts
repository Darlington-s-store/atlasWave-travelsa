interface AuthErrorLike {
  message?: string;
  status?: number;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAuthErrorMessage(error: AuthErrorLike | null | undefined, action: "login" | "signup") {
  if (!error) return null;

  const message = error.message?.trim() || "";

  if (action === "login") {
    if (error.status === 422) {
      return "Enter a valid email address and password.";
    }

    if (message.toLowerCase().includes("email not confirmed")) {
      return "Verify your email address before signing in.";
    }

    if (error.status === 400 && message.toLowerCase().includes("invalid login credentials")) {
      return "Email or password is incorrect.";
    }
  }

  if (action === "signup" && error.status === 422) {
    return "Enter a valid email address and a stronger password.";
  }

  return message || "Authentication failed.";
}
