// Quiet synthesized ambience; starts only after explicit activation.
export class Ambience {
 constructor(){this.enabled=false;this.context=null;}
 async toggle(){
  if(!this.context){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;this.context=new AC();this.gain=this.context.createGain();this.gain.gain.value=0;this.gain.connect(this.context.destination);[110,164.81,220.3].forEach((hz,i)=>{const osc=this.context.createOscillator(),v=this.context.createGain();osc.frequency.value=hz;v.gain.value=.06/(i+1);osc.connect(v).connect(this.gain);osc.start();});}
  await this.context.resume();this.enabled=!this.enabled;this.gain.gain.setTargetAtTime(this.enabled ? .32 : 0,this.context.currentTime,.65);return this.enabled;
 }
 dispose(){this.context?.close();}
}
