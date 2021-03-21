import React, {useEffect, useRef} from 'react';
import './whiteboard.scss';
import { Room } from 'white-web-sdk';
import { whiteboard } from '../stores/whiteboard';
import { t } from '../i18n';
import { Progress } from '../components/progress/progress';
import { ResizeObserver } from '@juggle/resize-observer';

interface WhiteBoardProps {
  room?: Room | null
  className: string
  loading: boolean
}

export default function Whiteboard ({
  room,
  className,
  loading
}: WhiteBoardProps) {

  const domRef = useRef(null);
  const domObserver = useRef<any>(null)

  useEffect(() => {
    if (!room || !whiteboard.state.room || !domRef.current) return;
    room.bindHtmlElement(domRef.current);
    domObserver.current = new ResizeObserver((entries, observer) => {
      if (!whiteboard.disconnected && whiteboard.state.room !== null && whiteboard.state.room.isWritable) {
        whiteboard.state.room.moveCamera({centerX: 0, centerY: 0});
        whiteboard.state.room.refreshViewSize();           
      }
    })
    if (domObserver.current) {
      domObserver.current.observe(domRef.current)
    }
    whiteboard.updateRoomState();
    return () => {
      if (whiteboard.state.room) {
        whiteboard.state.room.bindHtmlElement(null);
      }
    }
  }, [room, domRef]);

  return (
    <div className="whiteboard">
      { loading || !room ? <Progress title={t("whiteboard.loading")}></Progress> : null}
      <div ref={domRef} id="whiteboard" className={`whiteboard-canvas ${className}`}></div>
    </div>
  )
}