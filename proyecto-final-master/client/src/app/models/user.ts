// src/app/models/user.ts
export class User {
    constructor(
      public id: string,
      public name: string,
      public surname: string,
      public nick: string,
      public email: string,
      public password: string,
      public role: string,
      public image: string
    ) {}
  }
  