/*
  ConjureFormOutputState holds/maintains the formOutputObject for ConjureFormOutput
    - contains functions for modifying and updating the output object in a way similar to Ustra.js

  ConjureFormOutputState works by creating unique IDs for every parameter in the output object
    Then, when someone wants to update a parameter, they can just pass in the new value and the parameter name


  ConjureFormOutputState is modified from Ustra.js to accomodate arrays of items
    - When initializing ConjureFormOutputState, pass in an object with each ID being totally unique
    - If you want to have an array of objects, create:
        {
          "arrayID": [
            {object with unique IDs}
          ]
        }
    - ConjureFormOutputState will see the nested object inside the array and register it as an object in this.objArrayItemDefinitions
    - When you want to add a new object to that array, ConjureFormOutputState will declare a new object of the same form
          but it will create unique IDs to replace the already used IDs with
          These new IDs are stored in this.arrayIDConversions (newID -> originalID)
    - When you call update with the newly generated ID, it will target the right path to the object
          This is because pathLookups accomodate for array indexes


  Because the newly generated IDs are being created by ConjureFormOutputState, the IDs that <ConjureForm/> and <ConjureFormItem/>
    will use have to be passed from ConjureFormOutput to ConjureForm (instead of ConjureForm just using its own default IDs)
*/


class ConjureFormOutputState {

  constructor(obj) {
    this.truth = obj;
    this.pathLookup = {};
    this.objArrayItemDefinitions = {};
    this.arrayIDConversions = {};

    this.initializePathLookup(obj);
    this.registerArrayItemDefinitions(obj);
  }


  // Initialize ----------------------------------------------------------------
  /*
    Functions for initializing Ustra's pathLookup and objArrayItemDefinitions

    Paths:
    - Paths are a way to get to a specific location in an object
    - A Path Lookup table is of form:
          - {path_tag: [list of path_tags required to get here]}

    - this is used for easy traversal of the object,
          - only one path tag is required -> the full patch is fetched

    Limitations:
    - requires that path_tags are unique across the entire object
  */

  // initializes all the pathLookups in the object
  initializePathLookup(obj) {
    this.pathLookup = this.__initializePathLookup(obj, [], {});
  }

  __initializePathLookup(obj, currentPath, totalPath) {

    for (const [key, value] of Object.entries(obj)) {


      if (Array.isArray(value) && value.length > 0 && typeof(value[0]) === "object") {

        // since this value is an array, we need to recurse over every item in the array
        for (let i = 0; i < value.length; i++) {

          // create a path to the right index in this array
          let newPath = currentPath.slice();
          newPath.push(key);
          newPath.push(i);
          totalPath[key] = newPath;

          // recurse!
          totalPath = this.__initializePathLookup(value[i], newPath, totalPath);
        }

      } else {

        // create a path to this value
        let newPath = currentPath.slice();
        newPath.push(key);
        totalPath[key] = newPath;

        // if this is an object, recurse!
        if (typeof(value) === "object") {

          // don't recurse if the next object is an array of strings
          if ( ! (Array.isArray(value) && value.length > 0 && typeof(value[0]) === "string")) {
            totalPath = this.__initializePathLookup(value, newPath, totalPath);
          }
        }
      }
    }

    return totalPath;
  }

  // Array Item Definitions
  // searches for arrays in the object (truth) that contain sub objects
  // -> this table gets used when inserting new items into arrays
  registerArrayItemDefinitions(obj) {
    for (let key in obj) {

      let value  = obj[key];

      // if this is an array, we want to register its contents
      if (Array.isArray(value) && value.length > 0 && typeof(value[0]) === 'object') {
        this.objArrayItemDefinitions[key] = this.__createCopy(value[0]);   // register the array item definition
        this.registerArrayItemDefinitions(value[0]);    // recurse on the array item to find nested arrays

      // if this is an object, recurse
      } else if (typeof(value) === 'object') {
        this.registerArrayItemDefinitions(value);
      }
    }
  }

  // use this function when you want to create a copy of an object (to avoid referencing issues)
  // Using JSON this way isn't ideal, but it should work for any object that is compatible with Ustra
  __createCopy(oldObj) {
    return JSON.parse(JSON.stringify(oldObj));
  }


  // Update --------------------------------------------------------------------


  update(value, pathTag) {
    let fullPath = this.pathLookup[pathTag].slice(); // slice makes a copy
    this.truth = this.__update(value, this.truth, fullPath);
    return this.truth;
  }

  // for Arrays, the last index is [0] instead of being a key.
  // therefore, when we update a whole array we want to pop off the last index
  updateArray(value, pathTag) {
    let pathToParent = this.pathLookup[pathTag].slice();
    pathToParent.pop();
    this.truth = this.__update(value, this.truth, pathToParent);
    this.initializePathLookup(this.truth);
    return this.truth;
  }


  // recursive function for updating a value in truth
  __update(value, obj, path) {

    // if we've reached the end, bubble up
    if (path.length === 0) {
      return value;
    }

    // update the current object by updating the next one
    let nextPath = path.shift();
    obj[nextPath] = this.__update(value, obj[nextPath], path);
    return obj;
  }



  // Insert --------------------------------------------------------------------
  /*
    Functions for inserting new Array items into Ustra
      -> needs to create new unique IDs for the item being inserted
  */

  // returns an ID that is unique across Ustra
  getNewUniqueID(usedIDs = Object.keys(this.pathLookup)) {

    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    while (true) {
      let newID = "";
      for (let i = 0; i < 7; i++) {
        newID += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      // make sure that the ID is new before sending it back
      if (usedIDs.indexOf(newID) < 0) {
        return newID;
      }
    }
  }


  // parentID is the parent that contains the array we want to insert into
  // {parentID: [{item we want to duplicate}]}
  declareNewArrayItem(parentID) {

    // convert parentID to original ID if parentID is an alias
    let originalID = parentID;
    if (parentID in this.arrayIDConversions) {
      originalID = this.arrayIDConversions[parentID];
    }

    let array = this.get(parentID);
    let itemDefinition = this.objArrayItemDefinitions[originalID];
    itemDefinition = this.replaceAllIDsInObject(itemDefinition);

    array.push(itemDefinition);
    this.updateArray(array, parentID);
  }


  replaceAllIDsInObject(oldObj, newObj = {}, usedIDs = Object.keys(this.pathLookup)) {

    for (const [key, value] of Object.entries(oldObj)) {

      let newID = this.getNewUniqueID(usedIDs);
      this.addIDConversion(newID, key);     // log the original ID / pathTag this ID corresponds to
      usedIDs.push(newID);

      if (Array.isArray(value) && value.length > 0 && typeof(value[0]) === "object") {
        newObj[newID] = [this.replaceAllIDsInObject(value[0], {}, usedIDs)];
      } else if (Array.isArray(value)) {
        newObj[newID] = [];
      } else if (typeof(value) === "object") {
        newObj[newID] = this.replaceAllIDsInObject(value, {}, usedIDs);
      } else {
        newObj[newID] = value;
      }
    }
    return newObj;
  }

  addIDConversion(newID, originalID) {
    this.arrayIDConversions[newID] = originalID;
  }


  // delete --------------------------------------------------------------------

  // given the pathtag for an array, remove the item at a given index in that array
  deleteArrayItem(arrayID, arrayIndex) {
    let oldArray = this.get(arrayID);
    let newArray = [];
    for (let i = 0; i < oldArray.length; i++) {
      if (i !== arrayIndex) {
        newArray.push(oldArray[i]);
      }
    }
    this.updateArray(newArray, arrayID);
  }

  // Get -----------------------------------------------------------------------

  // returns object with specified pathTag
  get(pathTag = false) {
    // if no tag is specified, just return everything
    if (pathTag === false) { return this.truth; }

    // if specified tag isn't present in pathLookup, return false
    if (! (pathTag in this.pathLookup)) { return false; }

    // otherwise, get full path to the desired object and grab it
    let fullPath = this.pathLookup[pathTag].slice() // .slice makes a copy
    return this.__get(fullPath);
  }

  // returns the parent of a specified pathTag
  getParent(pathTag = false) {
    // if no tag is specified, just return everything
    if (pathTag === false) { return this.truth; }

    // if specified tag isn't present in pathLookup, return false
    if (! (pathTag in this.pathLookup)) { return false; }

    // otherwise, get full path and trim the end of it so we stop at the parent
    let fullPath = this.pathLookup[pathTag].slice();
    fullPath.pop();
    //fullPath.pop();

    // if parent is an array, then we need to remove the extra [i] in path to get the full array
    //  - In the case of [parent][i][pathTag], we want to return parent, not [i]
    if (fullPath.length - 1 > 0) {
      if (typeof(fullPath[fullPath.length - 1]) === "number") {
        fullPath.pop();
      }
    }

    return this.__get(fullPath);
  }


  // does the work for .get() and .getParent()
  __get(fullPath) {

    let temp = this.truth;

    // iterate through truth object until we reach the value we are looking for
    for (let i = 0; i < fullPath.length; i++) {
      let nextPath = fullPath[i];
      temp = temp[nextPath];

      if (i === fullPath.length - 1) {
        return temp;
      } else if (i === fullPath.length - 2 && typeof(fullPath[i + 1]) === "number") {
        return temp; // this means our target is an array, so we want to return the whole array
      }
    }

    // if we've made it this far and found nothing, return false
    return false;
  }


  getListOfAllIDs() {
    let allIDs = [];
    for (let key in this.pathLookup) {
      allIDs.push(key);
    }
    return allIDs;
  }


  // create a conversion table of {originalID -> newly generated random IDs}
  // pass in part of an outputObject
  getIDConversionTable(outputObject = false) {
    if (outputObject === false) { return this.arrayIDConversions; }
    return this.__getIDConversionTable(outputObject);
  }

  // does the work for this.getIDConversionTable()
  __getIDConversionTable(obj = {}, table = {}) {

    // recurse
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        table = this.__getIDConversionTable(obj[i], table);
      }
    } else if (typeof(obj) === "object") {

      for (let key in obj) {

        // add conversion
        if (key in this.arrayIDConversions) {
          let originalID = this.arrayIDConversions[key];
          table[originalID] = key;
        } else {
          table[key] = key;
        }

        // recurse
        table = this.__getIDConversionTable(obj[key], table);
      }
    }

    return table;
  }


  // gets the originalID for an ID (if the ID is the original, just return it)
  convertID(id) {
    if (id in this.arrayIDConversions) {
      return this.arrayIDConversions[id];
    }
    return id;
  }



  // ConjureFormOutputState will automatically create new IDs for arrays of objects and will save an ID mapping
  // getRelevantVersionOfID() is a function that finds the equivalent version of an ID for an object
  //  - contextID:    this is the ID we are anchoring around
  //                  The targetID will be in the path to this object (it won't be in a different array object)
  //  - targetID:     the ID we want to convert to match contextID
  getRelevantVersionOfID(targetID, contextID) {
    if (contextID in this.pathLookup) {

      // 1) check the parents of the target ID
      let path = this.pathLookup[contextID].slice();
      let upstreamResult = this.__getRelevantVersionOfID_upstream(targetID, path);
      if (upstreamResult) {
        return upstreamResult;
      }

      // 2) if the parents didn't find a new answer, check the children
      // covers case where contextID is an array of items (this steps into the correct version)
      let pathToObj = this.pathLookup[contextID].slice();
      let lastStepInPath = pathToObj[pathToObj.length - 1];
      let downstreamObject = this.get(contextID);
      if (typeof(lastStepInPath) === "number") { downstreamObject = downstreamObject[lastStepInPath]; }

      let downstreamResult = this.__getRelevantVersionOfID_downstream(targetID, downstreamObject);
      if (downstreamResult) {
        return downstreamResult;
      }

      // 3) check the current object
      let currentObj = this.getParent(contextID);
      for (let key in currentObj) {
        if (key === targetID) { return key; }
        if (this.arrayIDConversions[key] === targetID) { return key; }
      }

      // otherwise, just return the targetID
      return targetID;

    } else {
      return targetID;
    }
  }

  // does the recursive work for this.getRelevantVersionOfID()
  // looks at all IDs above the targetID (parents)
  __getRelevantVersionOfID_upstream(targetID, path) {

    // if we've reached the end, bubble up
    if (path.length === 0) {
      return false;
    }

    // check for case where object is nested in an array
    // -> we want to grab that parent array and then check all of the parameters in the item
    // if [{...}, {p1, p2, contextID}, {...}],    we want to grab the array and then look at p1, p2, etc...
    if ((path.length - 3 > 0) && (typeof(path[path.length - 2]) === "number")) {

      // check all items in the array at the right index
      let arrayParentID = path[path.length - 3];
      let arrayIndex = path[path.length - 2];
      let arrayObj = this.get(arrayParentID);

      for (let key in arrayObj[arrayIndex]) {
        if (key === targetID) { return key; }
        if ((key in this.arrayIDConversions) && (this.arrayIDConversions[key] === targetID)) { return key; }
      }

    // check for case where object
    } else {
      let obj = this.get(path[path.length - 1]);
      for (let key in obj) {
        if (key === targetID) { return key; }
        if ((key in this.arrayIDConversions) && (this.arrayIDConversions[key] === targetID)) { return key; }
      }
    }

    // recurse
    path.pop();
    if ((path.length - 1 > 0) && (typeof(path[path.length - 1]) === "number")) {
      path.pop();
    }
    return this.__getRelevantVersionOfID_upstream(targetID, path);
  }


  // checks all the IDs below an object for a targetID (or targetID conversion)
  // returns false if targetID is verbatum in the object (it doesn't have an alias)
  __getRelevantVersionOfID_downstream(targetID, obj) {

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        let childResult = this.__getRelevantVersionOfID_downstream(targetID, obj[i]);
        if (childResult !== false) { return childResult; }
      }
    } else if (typeof(obj) === "object") {
      for (let key in obj) {
        if ((key in this.arrayIDConversions) && (this.arrayIDConversions[key] === targetID)) { return key; }
        let childResult = this.__getRelevantVersionOfID_downstream(targetID, obj[key]);
        if (childResult !== false) { return childResult; }
      }
    }

    return false;
  }

}

export default ConjureFormOutputState;
