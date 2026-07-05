export const routes = {
  home: '/',
  newFile: '/files/new',
  data: '/data',
  file: (fileId: string) => `/files/${fileId}`,
  folder: (folderId: string) => `/folders/${folderId}`,
} as const;

export type AppRoute =
  | { name: 'home' }
  | { name: 'newFile' }
  | { name: 'data' }
  | { name: 'file'; fileId: string }
  | { name: 'folder'; folderId: string };

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

  if (pathname.startsWith('/folders/')) {
    const folderId = pathname.slice('/folders/'.length);

    if (folderId) {
      return { name: 'folder', folderId };
    }
  }

  return { name: 'home' };
}
