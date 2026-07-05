export const routes = {
  home: '/',
  newFile: '/files/new',
  data: '/data',
  file: (fileId: string) => `/files/${fileId}`,
} as const;

export type AppRoute =
  | { name: 'home' }
  | { name: 'newFile' }
  | { name: 'data' }
  | { name: 'file'; fileId: string };

export function getCurrentRoute(pathname: string): AppRoute {
  if (pathname === routes.newFile) {
    return { name: 'newFile' };
  }

  if (pathname === routes.data) {
    return { name: 'data' };
  }

  if (pathname.startsWith('/files/')) {
    const fileId = pathname.slice('/files/'.length);

    if (fileId) {
      return { name: 'file', fileId };
    }
  }

  return { name: 'home' };
}
