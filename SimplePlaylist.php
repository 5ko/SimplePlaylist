<?php  if (!defined('PmWiki')) exit();
/** 
  SimplePlaylist: Audio player from a list
  Copyright (c) 2024 Petko Yotov
  MIT License
  https://www.pmwiki.org/Cookbook/SimplePlaylist
*/

$RecipeInfo['SimplePlaylist']['Version'] = '2024-05-30';


function SimplePlaylistInit(){
  $conf = extGetConfig(['options'=>[]]);
  
  $attrs['playlist.js']['data-options'] = $conf['options'];
  
  extAddHeaderResource('playlist.css playlist.js', $attrs);
}
SimplePlaylistInit();
