import { environment } from "environments/environment";

export const authApiUri: string = `${environment.ws_url}auth`;
export const userApiUri: string = `${environment.ws_url}users`;
export const mapApiUri: string = `${environment.ws_url}maps`;
export const meApiUri: string = 'api/users/me';
export const versionApiUri: string = 'api/versions';
export const followApiUri: string = 'api/follow';
export const groupApiUri: string = 'api/groups';