import React, { useState, useMemo, useEffect } from "react";
import throttle from 'lodash/throttle';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { lookupWallets } from "../services/api.service";

const WalletLookupInput = ({onChange, onWalletChange}) => {
  
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);

  const fetch = useMemo(
    () => throttle(async (request, callback) => {
      // do the request
      setLoading(true);
      const res = await lookupWallets(request.input)
      setLoading(false);
      if (res.wallets) {
        callback(res.wallets)
      } else {
        callback([request.input])
      }
    }, 200),
    []
  );

  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        let newOptions= [];

        // if (value) {
        //   newOptions = [value];
        // }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);


  return <Autocomplete 
    freeSolo
    selectOnFocus
    id="combo-box-demo"
    options={options}
    loading={loading}
    sx={{ backgroundColor: 'white', flex: '1 1 auto', width: '1%', minWidth: 0 }}
    renderInput={(params) => 
      <TextField {...params} label="Lookup by Address (0x0000...) or Name" />
    }
    getOptionLabel={(option) => (typeof option === 'string') ? option : option.address}
    filterOptions={(x) => x} 
    value={value}
    onChange={(_, newValue) => {
      console.log('onChange', newValue)
      setOptions(newValue && options.indexOf(newValue) === -1 ? [newValue, ...options] : options);
      setValue(newValue);
      if (onWalletChange) onWalletChange(newValue);
    }}
    onInputChange={(_, newInputValue) => {
      console.log('onInputChange', newInputValue)
      setInputValue(newInputValue);
      if (onChange) onChange(newInputValue);
    }}
    renderOption={(props, option) => {
      const name = option.name
      const addr = (typeof option === 'string') ? option : option.address

      return (
        <li {...props}>
          {name && <b className="pr-2">{name}</b>}
          {addr}
        </li>
      );
    }}
    />

}

export default WalletLookupInput;

