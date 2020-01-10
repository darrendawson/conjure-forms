/*
  ConjureFormOutput is a class for representing the output of a ConjureForm after a user has filled it out in production

  Uses Ustra to maintain values in an efficient manner
    - Because IDs are unique across the entire ConjureForm, Ustra is able to uniquely identify locations properly
*/

import React from 'react';

import RenderFormOutputObject from './DevInputDetails/RenderFormOutputObject/RenderFormOutputObject.js';

import ConjureFormOutputState from './ConjureFormOutputState.js';

class ConjureFormOutput {

  constructor(outputObject, detailsLookup) {
    this.outputObject = new ConjureFormOutputState(outputObject);
    this.detailsLookup = detailsLookup;             // lookup table for finding details about a ConjureForm or ConjureFormItem
  }




  // answer form questions -----------------------------------------------------

  // for when a user types into an input
  answerInputQuestion(value, questionID) {
    this.outputObject.update(value, questionID);
  }

  // for when a user clicks on a multiple choice option
  // this function has to determine what to do with the selected click based off of what the question settings are
  // 0) if option is false                                  -> deselect all choices
  // 1) if question is a dropdown                           -> select the current one and deselect any others
  // 2) if this option is already selected                  -> deselect it
  // 3) if user hasn't maxed out number of selected options -> select it (add it to the list)
  // 4) if user has maxed out selected options,             -> deselect the oldest selected item (first in array) and select this one
  //       and value isnt already selected
  answerMultipleChoiceQuestion(value, questionID) {

    // get details about this question, such as minSelected and maxSelected
    let questionDetails;
    if (questionID in this.detailsLookup) {
      questionDetails = this.detailsLookup[questionID];
    } else {
      let convertedID = this.outputObject.convertID(questionID);
      questionDetails = this.detailsLookup[convertedID];
    }

    // get current answer
    let currentAnswer = this.outputObject.get(questionID);

    // 0) deselect all choices
    if (value === false && questionDetails.minSelected == 0) {
      this.outputObject.update([], questionID);
      return;
    }

    // 1) if dropdown, only select the current one (deselect all others)
    if (questionDetails.multipleChoiceType === "dropdown") {
      this.outputObject.update([value], questionID);
      return;
    }

    // 2) if user is clicking on an already selected option, unselect it
    //     UNLESS unselecting it would put you under the minSelected threshold
    if (currentAnswer.indexOf(value) >= 0 && currentAnswer.length - 1 >= questionDetails.minSelected) {
      let newAnswer = [];                                 // rebuild array without selected option
      for (let i = 0; i < currentAnswer.length; i++) {
        if (currentAnswer[i] !== value) {
          newAnswer.push(currentAnswer[i]);
        }
      }

      this.outputObject.update(newAnswer, questionID);
      return;
    }

    // 3) if the user can select the option, do so
    if (currentAnswer.length < questionDetails.maxSelected) {
      currentAnswer.push(value);
      this.outputObject.update(currentAnswer, questionID);
      return;
    }

    // 4) if already selected max number, deselect the oldest selected option and select the new one
    // USE == instead of === so JS compares number<->number instead of number<->string
    if (currentAnswer.length == questionDetails.maxSelected) {
      currentAnswer.splice(0, 1); // remove oldest selected item
      currentAnswer.push(value);
      this.outputObject.update(currentAnswer, questionID);
      return;
    }
  }

  // get -----------------------------------------------------------------------


  get(formID) {
    return this.outputObject.get(formID);
  }

  // gets a lookup table {original ConjureForm ID -> newly generated ID (for arrays)}
  getIDConversionTable(formID) {
    return this.outputObject.getIDConversionTable(formID);
  }

  // returns the entire output object
  getOutputObject(filterByRender = false) {
    if (! filterByRender) {
      return this.outputObject.get();
    } else {
      let outputObject = this.outputObject.get();
      let renderTable = this.createConditionalRenderLookupTable();
      return this.__filterOutUnrenderedValues(renderTable, outputObject);
    }
  }


  // returns details lookup for all items in the output object
  getDetailsLookup() {
    let lookup = this.detailsLookup;

    // add any newly generated IDs that were created for Arrays in ConjureFormOutputState
    for (let key in this.outputObject.arrayIDConversions) {
      let originalID = this.outputObject.arrayIDConversions[key];
      lookup[key] = lookup[originalID];
    }

    return lookup;
  }


  // public wrapper for calling this.__checkIfIDInOutput()
  // returns true if a formID is in the output object
  checkIfIDInOutput(id) {
    return this.__checkIfIDInOutput(id, this.getOutputObject());
  }

  // recursive function for handling this.checkIfIDInOutput()
  // returns true if an ID is in the ConjureFormOutput
  __checkIfIDInOutput(id, outputObject) {
    for (let key in outputObject) {
      if (key === id) {
        return true;
      } else if (Array.isArray(outputObject[key])) {
        for (let i = 0; i < outputObject[key].length; i++) {
          let childResult = this.__checkIfIDInOutput(id, outputObject[key][i]);
          if (childResult) {
            return true;
          }
        }
      } else if (typeof outputObject === "object") {
        let childResult = this.__checkIfIDInOutput(id, outputObject[key]);
        if (childResult) {
          return true;
        }
      }
    }
    return false;
  }

  // returns the IDs for all items nested within a ConjureForm
  getAllChildIDs(formID) {
    let obj = this.outputObject.get(formID);
    let childIDs = this.__getAllChildIDs(obj);
    return childIDs;
  }

  // recursively gets the IDs for all children in an object
  __getAllChildIDs(obj, childIDs = []) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        childIDs = this.__getAllChildIDs(obj[i], childIDs);
      }
    } else if (typeof(obj) === "object") {
      for (let key in obj) {
        childIDs.push(key);
        childIDs = this.__getAllChildIDs(obj[key], childIDs);
      }
    }
    return childIDs;
  }


  // returns a list with all versions of the same ID
  getAllVersionsOfSameID(formID) {

    let results = [formID];
    let idLookupTable = this.outputObject.getIDConversionTable();

    // case where given key is an alias -> repeat with the original ID
    if (formID in idLookupTable) {
      return this.getAllVersionsOfSameID(idLookupTable[formID]);
    }

    // otherwise, this is the original ID and we want to add every alias to results
    for (let key in idLookupTable) {
      if (idLookupTable[key] === formID) {
        results.push(key);
      }
    }

    return results;
  }


  // declare -------------------------------------------------------------------

  declareNewArrayItem(arrayID) {
    this.outputObject.declareNewArrayItem(arrayID);
  }

  // remove --------------------------------------------------------------------

  removeArrayItem(arrayID, arrayIndex) {
    this.outputObject.deleteArrayItem(arrayID, arrayIndex);
  }


  // Check conditional values --------------------------------------------------


  // returns true if the specified MultipleChoice question includes the desiredValue
  // uses contextID to find the right version of the MultipleChoice question
  // - (useful for when there are multiple versions of the same question due to arrays of subforms)
  checkForMCAnswer(mcQuestionID, contextID, desiredValue) {
    let questionID = this.getRelevantVersionOfID(mcQuestionID, contextID);
    let mcAnswers = this.outputObject.get(questionID);
    if (mcAnswers.indexOf(desiredValue) >= 0) {
      return true;
    } else {
      return false;
    }
  }



  // ConjureFormOutputState will automatically create new IDs for arrays of objects and will save an ID mapping
  //  - contextID:    this is the ID we are anchoring around
  //                  The targetID will be in the path to this object (it won't be in a different array object)
  //  - targetID:     the ID we want to convert to match contextID
  getRelevantVersionOfID(targetID, contextID) {
    return this.outputObject.getRelevantVersionOfID(targetID, contextID);
  }



  createConditionalRenderLookupTable() {

    let renderTable = {};
    let attemptsTable = {}; // keeps track of the number of times we have tried to add a certain formID to lookupTable and failed
    let formIDs = this.outputObject.getListOfAllIDs();

    // initialize attempts table to zero
    for (let i = 0; i < formIDs.length; i++) {
      attemptsTable[formIDs[i]] = 0;
    }

    // keep looping over formIDs until all dependencies have been dealt with
    while(Object.keys(renderTable).length < formIDs.length) {
      for (let i = 0; i < formIDs.length; i++) {

        let formID = formIDs[i];
        if (! (formID in renderTable)) {

          let formDetailID = this.outputObject.convertID(formID); // formDetails are stored by their original initialized IDs, so we may need to convert
          let formDetails = this.detailsLookup[formDetailID];
          let dependencyID = formDetails.renderCondition.questionID;
          let dependencyValue = formDetails.renderCondition.questionValue;

          // check for cases where the section will always render
          if (formDetails.renderConditionally === false) {
            renderTable[formID] = true;
          } else if ((dependencyID === false) || (dependencyValue === false)) {
            renderTable[formID] = true;
          }

          // check for case where the renderCondition dependency has already been answered
          else if (dependencyID in renderTable) {

            // if the form this one depends on won't render, neither should this one
            if (renderTable[dependencyID] === false) {
              renderTable[formID] = false;

            // if the form this one depends on will render, we need to check whether it has the right MC answer for this one to render
            } else {
              renderTable[formID] = this.checkForMCAnswer(dependencyID, formID, dependencyValue);
            }

          // if none of these worked, log that we couldn't figure out whether we should render this form
          // if we have done this too many times (like in an infinite loop), just render the item
          } else {
            attemptsTable[formID] += 1;
            if (attemptsTable[formID] > formIDs.length) {
              renderTable[formID] = true;
            }
          }
        }
      }
    }

    return renderTable;
  }


  // takes in an Output Object and a render table and removes all items that aren't rendered
  __filterOutUnrenderedValues(renderTable, oldObj, newObj = {}) {

    // handle case where object is an array of items
    if (Array.isArray(oldObj)) {
      newObj = [];
      for (let i = 0; i < oldObj.length; i++) {
        let childResult = this.__filterOutUnrenderedValues(renderTable, oldObj[i]); // recurse
        if (childResult !== false) {
          newObj.push(childResult);
        }
      }
      return newObj;

    // handle case where object is a dict
    } else if (typeof(oldObj) === "object") {
      for (let key in oldObj) {
        if ((key in renderTable) && (renderTable[key] === true)) {
          newObj[key] = this.__filterOutUnrenderedValues(renderTable, oldObj[key]);
        }
      }
      return newObj;

    // otherwise, object isn't an Array or a dict, so just return it
    } else {
      return oldObj;
    }
  }


  // export --------------------------------------------------------------------
  /*
    Functions for exporting the output of a ConjureForm into JSON
    -> handles all the key conversions from unique ConjureID to user specified parameter names
  */

  // exports output of a ConjureForm to JSON
  export(filterByRender = false) {
    let outputObject = this.getOutputObject(filterByRender);
    let detailsLookup = this.getDetailsLookup();
    let exported = JSON.stringify(this.__convertNames(detailsLookup, outputObject));
    return exported;
  }

  // exports output of a ConjureForm as an object (like export but without the JSON step)
  exportAsObj(filterByRender = false) {
    let outputObject = this.getOutputObject(filterByRender);
    let detailsLookup = this.getDetailsLookup();
    let exported = this.__convertNames(detailsLookup, outputObject);
    return exported;
  }

  // converts Conjure unique IDs to user specified parameter names
  __convertNames(detailsLookup, oldObj, newObj = {}) {

    // handle case where parent is an array and needs to recurse over the array
    if (Array.isArray(oldObj)) {
      newObj = [];
      for (let i = 0; i < oldObj.length; i++) {
        newObj.push(this.__convertNames(detailsLookup, oldObj[i]));
      }
      return newObj;

    // handle case where parent is a dict and needs to iterate over keys
    } else if (typeof(oldObj) === "object") {
      for (let key in oldObj) {
        let convertedID = (key in detailsLookup) ? detailsLookup[key]["outputID"] : key;
        newObj[convertedID] = this.__convertNames(detailsLookup, oldObj[key]);
      }
      return newObj;

    // otherwise, if parent is not an array or a dict, just return it because we cant recurse
    } else {
      return oldObj;
    }
  }

  // render --------------------------------------------------------------------

  render(filterByRender = false, selectedID = false, renderTextClickable = false, onClick_selectFormSection = () => {}) {

    // function for saving output to the user's clipboard
    let onClick_copyOutputToClipboard = () => {
      let outputJSON = this.export(filterByRender);
      navigator.clipboard.writeText(outputJSON);
    }

    return (
      <RenderFormOutputObject
        selectedID={selectedID}
        formOutputObject={this.getOutputObject(filterByRender)}
        formDetailsLookup={this.getDetailsLookup()}
        renderTextClickable={renderTextClickable}
        bannedIDs={[]}
        onClick_selectFormSection={onClick_selectFormSection}
        onClick_exportOutput={onClick_copyOutputToClipboard}
      />
    );
  }
}

export default ConjureFormOutput;
