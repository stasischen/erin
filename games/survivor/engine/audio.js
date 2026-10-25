// ✏️ Erin 可以改：音量 0～1；每個音效的 cooldown 是兩次之間休息的秒數。
// params 使用 ZzFX 的參數順序；這些音效與暫時旋律由本專案合成，沒有外部音檔。
(function () {
  const tuning = { soundVolume: .35, musicVolume: .035, maxVoices: 8, perSound: 2 };
  const sounds = {
    shoot: { cooldown: .09, params: [.35, 0, 620, .002, .015, .06, 1, 1, -8] },
    water: { cooldown: .12, params: [.3, .1, 380, .003, .02, .10, 0, 1, -5, 0, 0, 0, 0, .5] },
    hit: { cooldown: .07, params: [.25, .1, 180, .001, .01, .05, 4] },
    death: { cooldown: .09, params: [.4, .05, 540, .002, .02, .14, 1, 1, 6] },
    xp: { cooldown: .08, params: [.24, 0, 1050, .002, .01, .06, 0, 1, 3] },
    levelup: { cooldown: .4, params: [.5, 0, 520, .01, .12, .25, 1, 1, 1, 0, 260, .1] },
    select: { cooldown: .15, params: [.4, 0, 780, .003, .04, .16, 1, 1, 3] },
    dash: { cooldown: .18, params: [.35, .05, 220, .005, .03, .13, 3, 1, 9, 0, 0, 0, 0, .2] },
    lightning: { cooldown: .13, params: [.3, .05, 100, .002, .03, .12, 4, 1, -2, 0, 0, 0, 0, 1] },
    explosion: { cooldown: .2, params: [.5, .1, 90, .005, .04, .25, 4, 1, -2, 0, 0, 0, 0, 1] },
    warning: { cooldown: .8, params: [.45, 0, 210, .01, .2, .2, 1, 1, 0, 0, 110, .1, .15] },
    hurt: { cooldown: .25, params: [.4, .05, 160, .003, .03, .14, 2, 1, -3] },
    win: { cooldown: .7, params: [.5, 0, 660, .01, .2, .4, 1, 1, 2, 0, 330, .14] },
    over: { cooldown: .7, params: [.45, 0, 260, .01, .15, .4, 1, 1, -3] },
    click: { cooldown: .06, params: [.2, 0, 700, .001, .01, .04, 1] }
  };
  // 暫時 chiptune：之後換成 Erin 的 BeepBox 匯出，見 docs/survivor-audio.md。
  const songs = {
    calm: { step: .25, melody: [72,76,79,76,74,77,81,77,72,76,79,83,81,79,76,74], bass: [48,48,53,53] },
    boss: { step: .16, melody: [69,72,76,72,70,73,77,73,69,72,76,79,77,76,73,70], bass: [45,45,46,40] }
  };
  const voices = new Set(), notes = new Set(), last = {}, buffers = {};
  let context = null, soundGain = null, musicGain = null, track = null, nextNote = 0, beat = 0, timer = null;
  const muted = () => PREVIEW_MODE || globalThis.SURVIVOR_AUDIO_MUTED === true;
  function stopNodes(nodes) {
    for (const node of nodes) { try { node.stop(); node.disconnect(); } catch (_) {} }
    nodes.clear();
  }
  function stopMusic() {
    if (timer !== null) clearTimeout(timer);
    timer = null; track = null; stopNodes(notes);
  }
  function available() { return !muted() && context && context.state === "running" && !document.hidden; }
  function desiredTrack() { return available() && gameSettings.music && state.mode === "playing" ? (state.boss || state.bossIntro > 0 ? "boss" : "calm") : null; }
  function note(midi, time, duration, type, volume) {
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = type; oscillator.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(volume, time + .008);
    gain.gain.linearRampToValueAtTime(0, time + duration);
    oscillator.connect(gain); gain.connect(musicGain); notes.add(oscillator);
    oscillator.onended = () => { notes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(time); oscillator.stop(time + duration + .01);
  }
  function pump() {
    timer = null;
    if (desiredTrack() !== track || !track) { sync(); return; }
    try {
      const song = songs[track];
      if (nextNote < context.currentTime) nextNote = context.currentTime;
      while (nextNote < context.currentTime + .2) {
        note(song.melody[beat % song.melody.length], nextNote, song.step * .8, "square", .5);
        if (beat % 4 === 0) note(song.bass[Math.floor(beat / 4) % song.bass.length], nextNote, song.step * 3, "triangle", .8);
        beat++; nextNote += song.step;
      }
      timer = setTimeout(pump, 80);
    } catch (_) { stopMusic(); }
  }
  function sync() {
    if (!context) return;
    if (!available() || !gameSettings.sound) stopNodes(voices);
    const wanted = desiredTrack();
    if (track !== wanted) {
      stopMusic();
      if (wanted) { track = wanted; beat = 0; nextNote = context.currentTime + .02; pump(); }
    }
  }
  function unlock() {
    if (muted()) return;
    try {
      if (!context) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioClass) return;
        context = new AudioClass(); sharedAudio = context;
        soundGain = context.createGain(); soundGain.gain.value = tuning.soundVolume; soundGain.connect(context.destination);
        musicGain = context.createGain(); musicGain.gain.value = tuning.musicVolume; musicGain.connect(context.destination);
      }
      if (context.state === "suspended") {
        const resumed = context.resume();
        if (resumed && resumed.then) resumed.then(sync).catch(() => {});
      }
      sync();
    } catch (_) { /* 音訊不可用仍然能玩。 */ }
  }
  function play(id) {
    const sound = sounds[id];
    if (!sound || !available() || !gameSettings.sound) return false;
    const now = context.currentTime;
    if (now - (last[id] === undefined ? -Infinity : last[id]) < sound.cooldown || voices.size >= tuning.maxVoices || Array.from(voices).filter(v => v.soundId === id).length >= tuning.perSound) return false;
    try {
      const buffer = buffers[id] || (buffers[id] = Survivor.engine.zzfx.buffer(context, ...sound.params));
      const source = context.createBufferSource(); source.buffer = buffer; source.soundId = id;
      source.connect(soundGain); voices.add(source); last[id] = now;
      source.onended = () => { voices.delete(source); source.disconnect(); };
      source.start(); return true;
    } catch (_) { return false; }
  }
  Survivor.audio = Survivor.engine.audio = { unlock, play, sync, sounds, songs, tuning };
})();
