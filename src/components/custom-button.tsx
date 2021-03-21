import React from 'react';
import { Button } from '@material-ui/core';
export default function (props: any) {
  return (
    <Button id="room_join" variant="contained" className={props.className ? props.className : 'custom-button'} color="primary" onClick={props.onClick}>
      {props.name}
    </Button>
  )
}