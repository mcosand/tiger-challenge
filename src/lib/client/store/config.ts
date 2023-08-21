import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface ConfigStore {
  dev: {
    noExternalNetwork: boolean;
  }
}

const slice = createSlice({
  name: 'config',
  initialState: {
    dev: { noExternalNetwork: false, buildId: '' },
  },
  reducers: {
    set: (state, action: PayloadAction<ConfigStore>) => {
      Object.assign(state, action.payload);
    }
  },
});

export default slice.reducer;

export const ConfigActions = slice.actions;