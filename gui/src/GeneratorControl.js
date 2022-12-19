import SettingControl from './SettingControl';
import React, {useState, useEffect} from 'react';

let defaultGeneratorConfig = {
    active: false,
    frequency: 1000,
    duty: 50,
    wrap: 1250,
    div: 0,
    sysClk: 125000000
}



function generatorConfigToByteArray(generatorConfig) {
    let wrapBytes = [generatorConfig.wrap >> 8, generatorConfig.wrap & 0xFF];
    let divBytes = [generatorConfig.div >> 8, generatorConfig.div & 0xFF];
    return new Uint8Array([
        2, // Id of generator config message
        wrapBytes[0],
        wrapBytes[1],
        divBytes[0],
        divBytes[1]
    ]);
}

async function sendGeneratorConfig(generatorConfig, USBDevice) {
    const generatorConfigMessage = generatorConfigToByteArray(generatorConfig);
    await USBDevice.transferOut(3, generatorConfigMessage);
    console.log(generatorConfig);
    console.log("Generator config message sent");
}

export default function GeneratorControl({USBDevice}) {
    const [generatorConfig, setGeneratorConfig] = useState(defaultGeneratorConfig);

    function changeFrequency(dir) {
        let newVal = generatorConfig.frequency;
        if (dir == '-' && newVal > 0) {
            newVal -= 100;
        } else {
            newVal += 100;
        }
        generatorConfig.frequency = newVal;

        const maxWrap = Math.pow(2, 16);
        let div = Math.ceil(generatorConfig.sysClk / generatorConfig.frequency / maxWrap);
        let wrap = Math.round(generatorConfig.sysClk / generatorConfig.frequency / div);
        console.log('div', div);
        console.log('wrap', wrap);
        let f = generatorConfig.sysClk / div / wrap;
        console.log('fPWM:', f);

        generatorConfig.div = div;
        generatorConfig.wrap = wrap;
        setGeneratorConfig({...generatorConfig, frequency: newVal, div: div, wrap: wrap});
        sendGeneratorConfig(generatorConfig, USBDevice);
    }

    function changeDuty(dir) {
        let newVal = generatorConfig.duty;
        if (dir == '-' && newVal > 10) {
            newVal -= 10;
        } else if (dir == '+' && newVal < 100){
            newVal += 10;
        }
        setGeneratorConfig({...generatorConfig, duty: newVal});
        generatorConfig.duty = newVal;
        sendGeneratorConfig(generatorConfig, USBDevice);
    }

    function toggleActive() {
        setGeneratorConfig({...generatorConfig, active: !generatorConfig.active});
    }


  

  return (

    <div className="my-1 mx-1 bg-white rounded-md  shadow text-slate-700 text-l">
    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-t-md bg-white leading-5 text-slate-700  border border-slate-300 shadow">
        <div className={`flex-1 px-1 py-[2px] whitespace-nowrap ${generatorConfig.active ? "text-slate-700 bg-slate-200" : "text-slate-400 bg-slate-100"}`}>PWM gen.</div>
        <div className="px-3  hover:bg-slate-300 hover:text-slate-900 active:bg-slate-400  bg-slate-100"
        onClick={toggleActive}>
        {generatorConfig.active ? '-' : '+'}
        </div>
   
    </div>

    {false && <div className="flex h-4 px-1 border-x border-slate-300">
        <svg>
            <line x1="5" y1="10" x2="110" y2="10" style={{"stroke": "rgb(100,100,100)", "strokeWidth": "2"}} />
        </svg>
    </div>}

    <div className="flex px-1 border-x border-slate-300">
      <div className="flex-1 ">Freq.</div>
      <div>{generatorConfig.frequency}&nbsp;Hz</div>
    </div>

    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden  bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
        <div onClick={() => changeFrequency("-")} className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">-</div>
        <div onClick={() => changeFrequency("+")} className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">+</div>
    </div>

    <div className="flex px-1 border-x border-slate-300">
      <div className="flex-1 ">Duty</div>
      <div>{Math.round(generatorConfig.duty)}&nbsp;%</div>
    </div>

    <div className="pointer-events-auto flex divide-x divide-slate-400/20 overflow-hidden rounded-b-md  bg-slate-100   leading-5 text-slate-700 border border-slate-300 shadow">
        <div onClick={() => changeDuty("-")} className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">-</div>
        <div onClick={() => changeDuty("+")} className="flex-1 text-center  px-3 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300">+</div>
    </div>

    


</div>

  );

}
