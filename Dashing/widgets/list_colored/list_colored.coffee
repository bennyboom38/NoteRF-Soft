class Dashing.listColored extends Dashing.Widget
  ready: ->
    if @get('unordered')
      $(@node).find('ol').remove()
    else
      $(@node).find('ul').remove()
 
  onData: (data) ->
    $(@node).css('background-color', '#' + data.backGroundColor)
