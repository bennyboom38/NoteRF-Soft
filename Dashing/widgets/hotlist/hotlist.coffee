class Dashing.Hotlist extends Dashing.Widget
  ready: ->
    if @get('unordered')
      $(@node).find('ol').remove()
    else
      $(@node).find('ul').remove()
 
  onData: (data) ->
    node = $(@node)
    value = parseInt data.hotnessvalue
    # value = $(@node).find('hotnessvalue')  
    backgroundClass = "hotness#{value}"
    lastClass = @get "lastClass"
    node.toggleClass "#{lastClass} #{backgroundClass}"
    @set "lastClass", backgroundClass  
