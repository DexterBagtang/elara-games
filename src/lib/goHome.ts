import type { ImperativeRouter } from "expo-router";

/**
 * router.back() throws "GO_BACK was not handled" when there's no history to
 * pop — happens on web after a direct page load or refresh on a game/settings
 * route. Fall back to replacing with home in that case.
 */
export function goHome(router: ImperativeRouter) {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}
