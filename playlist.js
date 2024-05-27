/** 
  SimplePlaylist: Audio player from a list
  Copyright (c) 2024 Petko Yotov
  MIT License
  https://www.pmwiki.org/Cookbook/SimplePlaylist
*/

document.addEventListener('DOMContentLoaded', function() {
  var echo = console.log;
  var contenttypes = {
    flac: 'audio/x-flac',
    wav:  'audio/x-wav',
    mp3:  'audio/mpeg',
    ogg:  'audio/ogg',
    oga:  'audio/ogg',
    opus: 'audio/opus',
    aac:  'audio/aac',
    m4a:  'audio/mp4',
  }
  var exts = [];
  for(var ext in contenttypes) exts.push(ext);
  var extRX = new RegExp('\\.('+exts.join('|') + ')(?:[#]t=[\\d.,]+)?$', 'i');
  
  function shuffle(x) {
    x.sort(function() { return Math.random() - 0.5});
  }
  
  function makePagelist(ol) {    
    var items = Array.from(ol.children);
    if(ol.classList.contains('shuffle')) {
      shuffle(items);
      for(var item of items) {
        ol.appendChild(item);
      }
    }
    
    var tracks = [];
    var nbtracks = 0;
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
    }
    
    if(!tracks.length) return;
    
    var notracks = ol.querySelectorAll('li:not(.track,.divider)');
    for(var li of notracks) ol.appendChild(li);
    
    var audio = document.createElement('audio');
    audio.className = 'SimplePlaylist';
    audio.setAttribute('preload', 'metadata');
    audio.setAttribute('controls', 'controls');
    if(ol.classList.contains('autoplay'))
      audio.setAttribute('autoplay', 'autoplay');
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
    
    audio.addEventListener('ended', function(e) {
      if(!ol.classList.contains('autonext')) return;
      currentTrack+=1;
      if(ol.classList.contains('loop')) currentTrack %= tracks.length;
      playtrack();
    });
    
    function playtrack() {
      if(currentTrack>=tracks.length) return;
      audio.src = tracks[currentTrack];
      audio.load();
      audio.play();
      ol.querySelector('li.track.current').classList.remove('current');
      var currentitem = ol.querySelector('li.track[data-tracknb="'+currentTrack+'"]')
      currentitem.classList.add('current');
      
      var cs = window.getComputedStyle(ol);
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
  var playlists = document.querySelectorAll('ol.playlist,ol.SimplePlaylist');
  for(var ol of playlists) makePagelist(ol);
});
