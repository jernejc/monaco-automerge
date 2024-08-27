import { faker } from "@faker-js/faker";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "@/redux/store";

import { User } from "@/types";

import { config } from "@/config";

const initialState: User = {
  id: faker.string.uuid(),
  name: faker.internet.displayName(),
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
  color: faker.helpers.arrayElement(config.defaults.cursorColors)
}

export const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state = action.payload;
    }
  },
});

export const getUser = (state: RootState) => state.user;
export const userReducer = slice.reducer;
