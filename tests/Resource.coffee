Resource = require('../lib/Resource')

describe 'Resource', ->

  it 'it is a function', ->
    expect(Resource instanceof Function).toBe true

  describe 'createType', ->
    beforeEach ->
      @NewResourceType = Resource.createType 'NewResource',
        name: "Untitled"
        is_dog: false
        eye_color: "Brown"

      @instanceSettings =
        name: "Rover"
        is_dog: true
        hair_color: "Brown"
      @instance = new @NewResourceType @instanceSettings

    it 'is a Resource', ->
      expect(@instance instanceof @NewResourceType).toBe true
      expect(@instance instanceof Resource).toBe true

    it 'has a getKey function', ->
      expect(@instance.getKey instanceof Function).toBe true

    it 'returns an integer', ->
      key = @instance.getKey()
      # TODO - actually test something 

    describe 'export', ->
      beforeEach ->
        @data = @instance.export()

      it 'exports an object', ->
        expect(@data instanceof Object).toBe true

      it 'has a dependencies array', ->
        expect(@data.dependencies instanceof Array).toBe true

      it 'has settings', ->
        expect(@data.name).toEqual "Rover"
        expect(@data.is_dog).toBe true

      it 'inherits unspecified defaults', ->
        expect(@data.eye_color).toEqual "Brown"

      it 'ignores settings that are not part of the defaults', ->
        expect(@data.hair_color).toBeUndefined()

      it 'has a type attribute', ->
        expect(@data._type).toEqual 'NewResource'

