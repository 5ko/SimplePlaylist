/** 
  SimplePlaylist: Audio player from a list
  Copyright (c) 2024 Petko Yotov
  MIT License
  https://www.pmwiki.org/Cookbook/SimplePlaylist
*/

var SimplePlaylistOptions = document.currentScript.dataset.options;
document.addEventListener('DOMContentLoaded', function() {
  var echo = console.log;
  var extRX = /\.(flac|wav|mp3|ogg|oga|opus|aac|m4a|webm)(?:[#]t=[\d.,]+)?$/i;
  if(SimplePlaylistOptions)
    SimplePlaylistOptions = JSON.parse(SimplePlaylistOptions);
  
  var autoplay_count = 0;
  
  function shuffleElArray(x) {
    for(var a of x) a.rndsort = Math.random();
    x.sort(function(a, b) { return a.rndsort - b.rndsort });
  }
  
  function makePagelist(ol) {
    if(SimplePlaylistOptions) {
      for(var o of SimplePlaylistOptions) {
        if(ol.classList.contains('x'+o)) continue;
        ol.classList.add(o);
      }
    }
    
    var items = Array.from(ol.children);
    if(ol.classList.contains('shuffle')) {
      shuffleElArray(items);
      for(var item of items) {
        ol.appendChild(item);
      }
    }
    
    var tracks = [];
    for(var li of items) {
      var a = li.querySelector('a');
      if(!a) continue;
      var href = a.href;
      
      // ignore links that are not audio files
      if(a.className.match(/createlink/)) continue;
      if(href.match(/action=upload/)) continue;
      var m = href.match(extRX);
      if(! m) continue;
      li.classList.add('track');
      li.dataset.tracknb = tracks.length;
      tracks.push(href);
      li.dataset.counter = tracks.length;
    }
    
    if(!tracks.length) return;
    ol.classList.add('simpleplaylist');
    
    var notracks = ol.querySelectorAll('li:not(.track,.divider)');
    for(var li of notracks) ol.appendChild(li);
    
    var audio = document.createElement('audio');
    audio.className = 'simpleplaylist';
    audio.setAttribute('preload', 'metadata');
    audio.setAttribute('controls', 'controls');
    if(ol.classList.contains('autoplay') && ! autoplay_count++)
      audio.setAttribute('autoplay', 'autoplay');
    var prev = ol.previousElementSibling;
    if(prev && prev.dataset.jets)
      prev.insertAdjacentElement('beforebegin', audio);
    else
      ol.insertAdjacentElement('beforebegin', audio);

    audio.src = tracks[0];
    ol.querySelector('li.track').classList.add('current');
    
    var currentTrack = 0;
    
    audio.addEventListener('pause', function(e) {
      var a = audio.src.match(/[#]t=[\d.]+,([\d.]+)$/);
      if(!a) return;
      var endsec = Math.round(parseFloat(a[1]), 10);
      var currsec = Math.round(audio.currentTime);
      if(endsec == currsec) audio.dispatchEvent(new Event('ended'));
    });
    
    audio.addEventListener('error', function(e) {
      ol.querySelector('li.track.current').classList.add('error');
      audio.dispatchEvent(new Event('ended'));
    });
    
    audio.addEventListener('ended', function(e) {
      if(!ol.classList.contains('autonext')) return;
      currentTrack++;
      if(ol.classList.contains('loop')) currentTrack %= tracks.length;
      playtrack();
    });
    
    function playtrack() {
      var all_audios = document.querySelectorAll('audio.simpleplaylist');
      for(var el of all_audios) el.pause();
      var prev = ol.previousElementSibling;
      if(prev && prev.dataset.jets && prev.value !== '') {
        prev.value = '';
        prev.dispatchEvent(new Event('input'));
      }
      if(currentTrack>=tracks.length) return;
      if(audio.src == tracks[currentTrack]) {
        var a = tracks[currentTrack].match(/[#]t=([\d.]+)/);
        start = a? parseFloat(a[1]) : 0;
        audio.currentTime = start;
      }
      else {
        ol.querySelector('li.track.current').classList.remove('current');
        var currentitem = ol.querySelector('li.track[data-tracknb="'+currentTrack+'"]')
        currentitem.classList.add('current');
        audio.src = tracks[currentTrack];
        audio.load();
      }
      
      audio.play()
        .then(function(){currentitem.classList.remove('error');})
        .catch(function(error) { /*on error play next*/ });
      if(ol.clientHeight < ol.scrollHeight) // only if taller than container
        currentitem.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
    
    ol.addEventListener('click', function(e){
      var track = e.target.closest('li.track');
      if(!track) return;
      e.preventDefault();
      e.stopPropagation();
      
      currentTrack = parseInt(track.dataset.tracknb);
      
      playtrack();
    });
    
  }
  var playlists = document.querySelectorAll('ol.playlist,ol.simpleplaylist,ol.SimplePlaylist');
  for(var ol of playlists) makePagelist(ol);
});
