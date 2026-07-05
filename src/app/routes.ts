export const routes = {
  home: '/',
  newFile: '/files/new',
  data: '/data',
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

export function getCurrentRoute(pathname: string): AppRoute {
  if (pathname === routes.newFile) {
    return routes.newFile;
  }

  if (pathname === routes.data) {
    return routes.data;
  }

  return routes.home;
}
