Resource = require '../lib/Resource'
_ = require 'underscore'
matchers = require './custom_matchers'

describe 'Resource', ->

  beforeEach ->
    @addMatchers matchers

  it 'it is a function', ->
    expect(Resource).toBeFunction()

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
      expect(@instance).toBeInstanceOf @NewResourceType
      expect(@instance).toBeInstanceOf Resource

    it 'has a getKey function', ->
      expect(@instance.getKey).toBeFunction()

    describe 'getKey', ->
      it 'returns an integer', ->
        key = @instance.getKey()
        expect(key).toBeNumber()

    describe 'dependsOn', ->

      beforeEach ->
        @a = new @NewResourceType
          dependsOn: [@instance]
        @data = @a.export()

      it 'can export all the dependencies given', ->
        expect(@data.dependencies).toHaveLength 1

      it 'has the dependencies referenced by their key', ->
        expect(@data.dependencies[0]).toEqual @instance.getKey()

      it 'can add new dependencies programaticly', ->
        b = new @NewResourceType {}
        @a.dependsOn b
        @data = @a.export()

        expect(@data.dependencies).toHaveLength 2

    describe 'export', ->
      beforeEach ->
        @data = @instance.export()

      it 'exports an object', ->
        expect(@data).toBeObject()

      it 'has a dependencies array', ->
        expect(@data.dependencies).toBeArray()

      it 'has settings', ->
        expect(@data.name).toEqual "Rover"
        expect(@data.is_dog).toBe true

      it 'inherits unspecified defaults', ->
        expect(@data.eye_color).toEqual "Brown"

      it 'ignores settings that are not part of the defaults', ->
        expect(@data.hair_color).toBeUndefined()

      it 'has a type attribute', ->
        expect(@data._type).toEqual 'NewResource'

