Resource = require('../lib/Resource')

describe 'Resource', ->

  it 'it is a function', ->
    expect(Resource instanceof Function).toBe true

  describe 'createType', ->
    beforeEach ->
      @NewResourceType = Resource.createType 'NewResource', {}
      @instance = new @NewResourceType {}

    it 'is a Resource', ->
      expect(@instance instanceof @NewResourceType).toBe true
      expect(@instance instanceof Resource).toBe true

    it 'can be exported', ->
      data = @instance.export()
      console.log data
