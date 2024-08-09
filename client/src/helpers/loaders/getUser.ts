
import { faker } from "@faker-js/faker";

import { config } from "../../config";

import { User } from "../../types";


export function getUser(): User {
  return {
    id: faker.string.uuid(),
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    color: faker.helpers.arrayElement(config.defaults.cursorColors)
  }
}