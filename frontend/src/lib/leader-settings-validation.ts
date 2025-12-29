export function validateDisplayName(name: string) {
  return /^[A-Za-z]+\s+[A-Za-z]*(\s*[A-Za-z]*)*$/.test(name.trim());
}
export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
export function validatePhone(phone: string) {
  const cleaned = phone.replace(/\s+/g, "");
  return /^\+27\d{9}$/.test(cleaned);
}
export function validatePassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}