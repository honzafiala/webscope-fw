import React, {useEffect, useState} from 'react';
import './App.css';
import WebglAppSin from "./webglAppSin";
import ChannelControl from './ChannelControl';
import getDummyData from './dummyData';
import HorizontalControl from './HorizontalControl';
import CanvasPlot from './CanvasPlot';
import CursorControl from './CursorControl';
import TriggerControl from './TriggerControl';
import Floating from './Floating';
import CaptureControl from './SamplingControl';
import Capture from './Capture';

let defaultCaptureConfig = {
  activeChannels: [true, true, false],
  numActiveChannels: 2,
  channelColors: ['#d4c84e', '#E78787'],
  trigger: {
    channels: [true, false], 
    threshold: 77, // 1 V
    edge: "UP"
  },
  preTrigger: 0.1,
  sampleRate: 250000,
  captureDepth: 10000,
  captureMode: "Auto"
};

let defaultCaptureData = [[], []];


let defaultViewConfig = {
  visibleChannels: [true, true, false],
  vertical: [
    {offset: 0, zoom: 1}, 
    {offset: 0, zoom: 1},
    {offset: 0, zoom: 1}
  ],
  horizontal: {
    zoom: 1,
    offset: 0,
    viewCenter: defaultCaptureConfig.captureDepth / 2
  },
  grid: true
}

let defaultCursorConfig = {
  cursorX: {
    visible: false,
    start: 0,
    end: defaultCaptureConfig.captureDepth
  }
}

let defaultCaptureState = {
  running: false,
  continuous: false
}


export default function App() {
  let [captureConfig, setCaptureConfig] = useState(defaultCaptureConfig);
  let [viewConfig, setViewConfig] = useState(defaultViewConfig);
  let [captureData, setCaptureData] = useState(defaultCaptureData);
  let [cursorConfig, setCursorConfig] = useState(defaultCursorConfig);
  let [USBDevice, setUSBDevice] = useState(null);
  let [captureState, setCaptureState] = useState(defaultCaptureState);


  async function connectDevice() {
    let device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0xcafe }] });
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(2);
    setUSBDevice(device);

    // "Dummy" IN transfer
    let result = await device.transferIn(3, 4);

  }






  return (
    <div className='root'>
      {cursorConfig.cursorX.visible && <Floating captureConfig={captureConfig} captureData={captureData} cursorConfig={cursorConfig}/>}
    <div className="app">
      <div className="topbar">
        <button onClick={connectDevice}><span role="img" aria-label="dog">{USBDevice == null ? "❌ Connect device" : "✅ Connected"} </span></button>
        <Capture captureConfig={captureConfig} setCaptureConfig={captureConfig} captureState={captureState} setCaptureState={setCaptureState}  USBDevice={USBDevice} setCaptureData={setCaptureData} setCaptureConfig={setCaptureConfig}/>
        <CaptureControl captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}/>
        <button onClick={() => setViewConfig({...viewConfig, grid: !viewConfig.grid})}>Toggle grid</button>
      </div>
      <div className="main">
        <CanvasPlot data={captureData} viewConfig={viewConfig} cursorConfig={cursorConfig} captureConfig={captureConfig}/>

        <div className='side'>
          <ChannelControl number="1" color="#FFF735" captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}
          viewConfig={viewConfig} setViewConfig={setViewConfig}/>
          <ChannelControl number="2" color="#E78787" captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}
          viewConfig={viewConfig} setViewConfig={setViewConfig}/>

      <ChannelControl number="3" color="#68E05D" captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}
          viewConfig={viewConfig} setViewConfig={setViewConfig}/>

          <CursorControl cursorConfig={cursorConfig} viewConfig={viewConfig} captureConfig={captureConfig} setCursorConfig={setCursorConfig}/>
          <HorizontalControl captureConfig={captureConfig} viewConfig={viewConfig} setViewConfig={setViewConfig}/>
          <TriggerControl captureConfig={captureConfig} setCaptureConfig={setCaptureConfig}/>
         
        </div>
      </div>
      </div>
    </div>
  );
}