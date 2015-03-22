ResourceIndex = require '../lib/ResourceIndex'
File = require '../lib/File'
custom_matchers = require './custom_matchers'
_ = require 'underscore'

describe 'ResourceIndex', ->
  beforeEach -> this.addMatchers custom_matchers
  afterEach -> ResourceIndex.reset()

  it 'has a catalog function', ->
    expect(ResourceIndex.catalog).toBeFunction()
  it 'has a getResourceByKey function', ->
    expect(ResourceIndex.getResourceByKey).toBeFunction()
  it 'has a getCatalog function', ->
    expect(ResourceIndex.getCatalog).toBeFunction()
  it 'has a reset function', ->
    expect(ResourceIndex.reset).toBeFunction()

  describe 'catalog', ->

    beforeEach ->
      spyOn(ResourceIndex, 'catalog').andCallThrough()
      @file1 = new File()
      @file2 = new File()
      @file3 = new File()

    it 'gets called when Resources are created', ->
      expect(ResourceIndex.catalog).toHaveBeenCalled()
      expect(ResourceIndex.catalog.callCount).toBe 3

    it 'creates unique keys for each Resource', ->
      key1 = @file1.getKey()
      key2 = @file2.getKey()
      key3 = @file3.getKey()
      expect(key1).not.toEqual key2
      expect(key1).not.toEqual key3
      expect(key2).not.toEqual key3

  describe 'getResourceByKey', ->
    beforeEach ->
      @file1 = new File()

    it 'returns the resource by its key', ->
      key = @file1.getKey()
      expect(ResourceIndex.getResourceByKey key).toEqual @file1

  describe 'getCatalog', ->
    beforeEach ->
      @file1 = new File()
      @file2 = new File()
      @file3 = new File()
      @catalog = ResourceIndex.getCatalog()

    it 'is an object', ->
      expect(@catalog).toBeObject()
    it 'has keys for each Resource in catalog', ->
      expect(@catalog[@file1.getKey()]).toBeDefined()
      expect(@catalog[@file2.getKey()]).toBeDefined()
      expect(@catalog[@file3.getKey()]).toBeDefined()
    it 'matches keys to the export of a Resource', ->
      expect(@catalog[@file1.getKey()]).toEqual @file1.export()
      expect(@catalog[@file2.getKey()]).toEqual @file2.export()
      expect(@catalog[@file3.getKey()]).toEqual @file3.export()

  describe 'reset', ->
    beforeEach ->
      @file1 = new File()
      @file2 = new File()
      @file3 = new File()
      @catalog = ResourceIndex.getCatalog()
      ResourceIndex.reset()
    it 'empties the catalog', ->
      expect(_.keys(@catalog)).toHaveLength 3
      expect(_.keys ResourceIndex.getCatalog()).toHaveLength 0

    
  
