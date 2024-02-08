import { TextFieldProps } from '@mui/material';
import * as React from 'react';
import { TextField } from './Material';

export const CalTopoMapField = ({ value, setValue, ...props} : { value: string, setValue: (value: string) => void } & TextFieldProps) => (
  <TextField
    label="Map Address"
    helperText={<>
    https://caltopo.com/m/ABCDE/12345768<br/>
    /m/ABCDE/12345678<br/>
    https://caltopo.com/m/ABCDE<br/>
    /m/ABCDE<br/>
    ABCDE<br/>
    </>}
    {...props}
    onChange={evt => setValue(evt.currentTarget.value)}
  />
);