import React, { useState, useEffect, useRef,CSSProperties } from 'react';
import { Theme, FormControl, Tooltip } from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import Button from '../components/custom-button';
import RoleRadio from '../components/role-radio';
import Icon from '../components/icon';
import FormInput from '../components/form-input';
import FormSelect from '../components/form-select';
import LangSelect from '../components/lang-select';
import { isElectron } from '../utils/platform';
import { usePlatform } from '../containers/platform-container';
import {useHistory} from 'react-router-dom';
import { roomStore } from '../stores/room';
import {GithubIcon} from '../components/github-icon';
import { globalStore, roomTypes } from '../stores/global';
import { t } from '../i18n';
import GlobalStorage from '../utils/custom-storage';
import { genUUID } from '../utils/api';
import Log from '../utils/LogUploader';
import axios from 'axios';

const useStyles = makeStyles ((theme: Theme) => ({
  formControl: {
    minWidth: '240px',
    maxWidth: '240px',
  }
}));

const hiddenStyle: CSSProperties = {
  display: 'none',
}

type SessionInfo = {
  roomName: string
  roomType: number
  yourName: string
  role: string
}

const defaultState: SessionInfo = {
  roomName: '',
  roomType: 0,
  role: '',
  yourName: '',
}

function HomePage() {
  document.title = t(`home.short_title.title`)

  const classes = useStyles();

  const history = useHistory();

  const handleSetting = (evt: any) => {
    history.push({pathname: `/device_test`});
  }

  const [lock, setLock] = useState<boolean>(false);

  const handleUpload = (evt: any) => {
    setLock(true)
    Log.doUpload().then((resultCode: any) => {
      globalStore.showDialog({
        type: 'uploadLog',
        message: t('toast.show_log_id', {reason: `${resultCode}`})
      });
    }).finally(() => {
      setLock(false)
    })
  }

  const {
    HomeBtn
  } = usePlatform();

  const ref = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      ref.current = true;
    }
  }, []);

  const [session, setSessionInfo] = useState<SessionInfo>(defaultState);

  const [required, setRequired] = useState<any>({} as any);

  const handleSubmit = () => {
    
    //ashhab
    // console.log(document.getElementById("room_join"))
    const queryString = window.location.href;
    var url = new URL(queryString);
    var room_id = url.searchParams.get("room");
    var token = url.searchParams.get("token");
    var room_type = url.searchParams.get("roomtype");
    var subject = url.searchParams.get("subject");


    var data = {
      'token':token,
      'roomName': room_id,
      'roomType': room_type,
      'subject': subject,
      'yourName': '',
    }
    
    axios.post('http://127.0.0.1:8000/creat_class_room', data).then((res)=>{

            let new_data = res.data;
            session.role = new_data['role'];
            
            if (!new_data['roomName']) {
              setRequired({...required, roomName: t('home.missing_room_name')});
              // window.history.back();
              return;
            }

            if (!new_data['yourName']) {
              setRequired({...required, yourName: t('home.missing_your_name')});
              // window.history.back();
              return;
            }

            if (!new_data['role']) {
              setRequired({...required, role: t('home.missing_role')});
              // window.history.back();
              return;
            }
            
            if (!new_data['roomType']) return;
            const path = roomTypes[session.roomType].path
            globalStore.showLoading()
            roomStore.LoginToRoom({
              userName: new_data['yourName'],
              roomName: new_data['roomName'],
              role: new_data['role'],
              type: new_data['roomType'],
              uuid: genUUID()
            }).then(() => {
              console.log(new_data);
              alert("sdgfhs")
              history.push(`/classroom/${path}`)
            }).catch((err: any) => {
              if (err.hasOwnProperty('api_error')) {
                return
              }
              if (err.reason) {
                globalStore.showToast({
                  type: 'rtmClient',
                  message: t('toast.rtm_login_failed_reason', {reason: err.reason}),
                })
              } else {
                globalStore.showToast({
                  type: 'rtmClient',
                  message: t('toast.rtm_login_failed'),
                })
              }
              console.warn(err)
            }).finally(() => {
              globalStore.stopLoading();
            })
    }).catch((err)=>{
      alert(err.response.data.message);
      if(err.response.data.role=="teacher"){
        window.location.href = "http://127.0.0.1:8000/admin/classroom";
      }
      window.location.href = "http://127.0.0.1:8000/";
    });

    
  }

  return (
    <div  className={`flex-container ${isElectron ? 'draggable' : 'home-cover-web' }`}>
      {isElectron ? null : 
      <div  className="web-menu">
        <div className="web-menu-container">
          <div className="short-title">
            <span className="title">{t('home.short_title.title')}</span>
            <span className="subtitle">{t('home.short_title.subtitle')}</span>
            <span className="build-version">{t("build_version")}</span>
          </div>
          <div className="setting-container">
            <div className="flex-row">
              <Tooltip title={t("icon.upload-log")} placement="top">
                <span>
                  <Icon className={lock ? "icon-loading" : "icon-upload"} onClick={handleUpload}></Icon>
                </span>
              </Tooltip>
              <Tooltip title={t("icon.setting")} placement="top">
                <span>
                  <Icon className="icon-setting" onClick={handleSetting}/>
                </span>
              </Tooltip>
            </div>
            <Tooltip title={t("icon.lang-select")} placement="top">
              <span>
                <LangSelect
                value={GlobalStorage.getLanguage().language.match(/^zh/) ? 0 : 1}
                onChange={(evt: any) => {
                  const value = evt.target.value;
                  if (value === 0) {
                    globalStore.setLanguage('zh-CN');
                  } else {
                    globalStore.setLanguage('en');
                  }
                }}
                items={[
                  {text: '??????', name: 'zh-CN'},
                  {text: 'En', name: 'en'}
                ]}></LangSelect>
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
      }
      <div  className="custom-card">
        {!isElectron ? <GithubIcon /> : null}
        <div className="flex-item cover">
          {isElectron ? 
          <>
          <div className={`short-title ${globalStore.state.language}`}>
            <span className="title">{t('home.short_title.title')}</span>
            <span className="subtitle">{t('home.short_title.subtitle')}</span>
          </div>
          <div className={`cover-placeholder ${t('home.cover_class')}`}></div>
          <div className='build-version'>{t("build_version")}</div>
          </>
          : <div className={`cover-placeholder-web ${t('home.cover_class')}`}></div>
          }
        </div> 
        <div   className="flex-item card" >
          <div  className="position-top card-menu">
            <HomeBtn handleSetting={handleSetting}/>
          </div>
          <div className="position-content flex-direction-column">
           <FormControl className={classes.formControl}>
              <FormInput Label={t('home.room_name')} value={session.roomName} onChange={
                (val: string) => {
                  setSessionInfo({
                    ...session,
                    roomName: val
                  });
                }}
                requiredText={required.roomName}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <FormInput Label={t('home.nickname')} value={session.yourName} onChange={
                (val: string) => {
                  setSessionInfo({
                    ...session,
                    yourName: val
                  });
                }}
                requiredText={required.yourName}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <FormSelect 
                Label={t('home.room_type')}
                value={session.roomType}
                onChange={(evt: any) => {
                  setSessionInfo({
                    ...session,
                    roomType: evt.target.value
                  });
                }}
                items={roomTypes.map((it: any) => ({
                  value: it.value,
                  text: t(`${it.text}`),
                  path: it.path
                }))}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <RoleRadio value={session.role} onChange={(evt: any) => {
                 setSessionInfo({
                   ...session,
                   role: evt.target.value
                 });
              }} requiredText={required.role}></RoleRadio>
            </FormControl>
            
            <Button   name={t('home.room_join')} onClick={handleSubmit}/>
          </div>
        </div>
      </div>
    </div>
  )
}
export default React.memo(HomePage);