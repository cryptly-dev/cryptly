import { backend, bearer, unwrap, type Schemas } from "$lib/api/backend";

export type User = Schemas["UserSerialized"];
export type UpdateUserDto = Schemas["UpdateUserBody"];

export class UserApi {
  static getMe(jwtToken: string) {
    return unwrap(
      backend.GET("/users/me", { headers: bearer(jwtToken) }),
      "Failed to load user",
    );
  }

  static updateMe(jwtToken: string, updateUserDto: UpdateUserDto) {
    return unwrap(
      backend.PATCH("/users/me", {
        headers: bearer(jwtToken),
        body: updateUserDto,
      }),
      "Failed to update user",
    );
  }
}
