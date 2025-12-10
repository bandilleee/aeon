import { redirect } from "next/navigation";

/**
 * Home Page
 * ---------
 * For now, we redirect to login.
 * Later, this could show a landing page for non-authenticated users.
 */
export default function HomePage() {
  // Redirect to login page
  redirect("/login");
}