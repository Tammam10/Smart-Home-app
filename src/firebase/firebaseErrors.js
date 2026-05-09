// utils/firebaseErrors.js
export const getFirebaseAuthErrorMessage = (error) => {
  const code = error?.code || "";

  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address";

    case "auth/user-not-found":
      return "No account found with this email";

    case "auth/wrong-password":
      return "Incorrect password";

    case "auth/email-already-in-use":
      return "This email is already in use";

    case "auth/weak-password":
      return "Password must be at least 6 characters";

    case "auth/missing-password":
      return "Please enter your password";

    case "auth/invalid-credential":
      return "Invalid email or password";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection";

    case "auth/requires-recent-login":
      return "Please log in again before changing your password";

    default:
      return error?.message || "Something went wrong";
  }
};
