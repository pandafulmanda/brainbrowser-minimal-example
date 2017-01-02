{
  const dataTypes = [{
    type: 'surface',
    fileTypes: ['obj', 'json', 'mgh', 'asc', 'nii', 'vtk']
  }, {
    type: 'intensity',
    fileTypes: ['txt', 'csv']
  }, {
    type: 'atlas.values',
    fileTypes: ['txt', 'csv']
  }, {
    type: 'atlas.labels',
    fileTypes: ['txt', 'csv']
  }, {
    type: 'intensity.grouped',
    fileTypes: ['txt', 'csv']
  }];

  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  var lookupDataKey = _.template('name:{{name}},type:{{type}}');

  function locationToParts(location){
    const parts = location.split('/');
    const filename = _.last(parts);
    const [basename, extension] = filename.split('.');

    return {
      filename: filename,
      basename: basename,
      extension: extension
    };
  }

  function guessItemName(location){
    const {basename} = locationToParts(location);
    return basename;
  }

  function guessItemFormat(location){
    const {extension} = locationToParts(location);
    return extension;
  }

  function guessItemType(location){
    const {extension} = locationToParts(location);
    const match = _.find(dataTypes, function(type){
      return _.includes(type.fileTypes, extension);
    });

    return match.type;
  }

  // TODO make this unnecessary.
  function makeLinkItem(config){
    let {type, name, format} = config;
    const location = name;
    name = guessItemName(location);
    type = type || guessItemType(location);
    format = format || guessItemFormat(location);

    return {type, name};
  }

  function makeDataItem(config){
    let {location, type, name, format} = config;
    name = name || guessItemName(location);
    type = type || guessItemType(location);
    format = format || guessItemFormat(location);

    return {location, type, name, format};
  }

  function fillInConfig(configObject){
    const {data, links} = configObject
    const filledInData = _.map(data, makeDataItem);

    return _.merge({data: filledInData}, configObject);
  }


  class Config {
    constructor (configObject) {  
      const config = fillInConfig(configObject);
      const data = _.mapKeys(config.data, lookupDataKey);

      this.getConfig = function(){
        return config;
      }
      this.getData = function(){

      }
    }

    get (matchingProperties) {
      return _.filter(this.getConfig().data, matchingProperties);
    }

    getForLink (type, linkToMatch) {
      const link = _.chain(this.getConfig().links)
        .find(function(link){
          return _.find(link, makeLinkItem(linkToMatch));
        })
        .find({type: type})
        .value();

      if(link) {
        return _.first(this.get(link));
      }
    }

  }

  window.Config = Config;
}