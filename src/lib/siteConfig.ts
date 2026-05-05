// Public production URL where users should land after email verification / OAuth.
// We always send users to the deployed Vercel URL, regardless of where they signed up from.
export const PRODUCTION_URL = "https://atlaswavetravel.vercel.app";

export const getRedirectUrl = (path = "") => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${PRODUCTION_URL}${path ? clean : ""}`;
};
