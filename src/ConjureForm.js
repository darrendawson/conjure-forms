/*
  ConjureForm is a datastructure for representing forms on Conjure
   - used during the creation/manipulation AND rendering processes
   - is recursive. A ConjureForm is a container that contains child ConjureForms and ConjureFormItems
   - uses the <ConjureFormComponent/> component to render
*/

import React from 'react';

import ConjureFormComponent from './Render/ConjureFormComponent.js';
import ConjureFormItem from './ConjureFormItem.js';
import ConjureFormOutput from './ConjureFormOutput.js';

const __containerTypes = ["all", "page", "card", "subcard"];

// default colors
const __allColorDefault = "#eaeaea";
const __pageColorDefault = "#eaeaea";
const __cardColorDefault = "#f4f4f4";
const __shadowColorDefault = '#7c7c7c';
const __subcardColorDefault = "#eaeaea";

class ConjureForm {

  constructor(formID = null, formType = "all") {

    this.subforms = {};
    this.items = {};
    this.order = [];
    this.formID = (formID !== null) ? formID : this.getNewUniqueID();


    // when a user fills out the questions in this ConjureForm, they will all be entered into a dictionary
    // - result[outputID] = {user answers}
    // therefore, nested ConjureForm's will have result[outputID_1]...[outputID_N]
    // defaults to formID because that is unique. User will modify the value from there
    this.formDetails = {
      "containerType": formType,
      "outputID": this.formID,
      "maxForms": 1,
      "newSubformButtonText": "Add New",
      "renderConditionally": false,
      "renderCondition": {'questionID': false, 'questionValue': false}
    };


    // padding for a container includes padding above, on the sides, and below
    this.appearance = {
      paddingTop: "10",
      paddingSides: "20",
      paddingBottom: "10"
    };

    // add colors to appearance
    this.appearance['colorControlButtonBackground'] = "#262626";
    this.appearance['colorControlButtonText'] = "#ffffff";

    if (formType === "page") {
      this.appearance['colorBackground'] = __pageColorDefault;
    } else if (formType === "card") {
      this.appearance['colorBackground'] = __cardColorDefault;
      this.appearance['colorCardShadow'] = __shadowColorDefault;
    } else if (formType === "subcard") {
      this.appearance['colorBackground'] = __subcardColorDefault;
    }
  }


  // returns the className of this object
  getClassName() {
    return "ConjureForm";
  }

  getConjureID() {
    return this.formID;
  }


  // IDs -----------------------------------------------------------------------
  /*
    - Functions for managing and distributing unique IDs to every child in the ConjureForm
  */

  // gets a random String to act as a unique key for a subform or item
  // calls getAllUsedIDs() to make sure this is a unique ID across the entire ConjureForm tree
  getNewUniqueID() {

    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let usedIDs = this.getAllUsedIDs();

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


  // gets all the IDs that are used in the form so far, including all children subforms/items
  // - calls all children .getAllUsedIDs()
  getAllUsedIDs() {
    let usedIDs = [];

    // get all IDs used by subforms
    for (let key in this.subforms) {

      // add IDs for children forms
      let childIDs = this.subforms[key].getAllUsedIDs();
      for (let i = 0; i < childIDs.length; i++) {
        usedIDs.push(childIDs[i]);
      }

      // add ID for current form
      usedIDs.push(key);
    }

    // get all IDs used by items
    for (let key in this.items) {
      usedIDs.push(key);
    }

    return usedIDs;
  }


  // searches through nested ConjureForm to find the ID of the parent of the childID
  // -> used to get the parent ConjureForm's ID when calling declareNewItem() or declareNewSubform()
  getParentFormID(childID) {

    // check to see if this ConjureForm is the parent
    for (let key in this.subforms) {
      if (key === childID) {
        return this.formID;
      }
    }

    for (let key in this.items) {
      if (key === childID) {
        return this.formID;
      }
    }

    // since this ConjureForm is not the parent, check to see if any of its children are
    for (let key in this.subforms) {
      let result = this.subforms[key].getParentFormID(childID);
      if (result) {
        return result;
      }
    }

    // otherwise, bubble up a negative result
    return false;
  }


  // Create / Add --------------------------------------------------------------
  /*
    functions for adding new info into ConjureForm
    - every item within a ConjureForm must have a unique ID

    External Functions: are meant to be called publicly
      - declareNewSubform()
      - declareNewItem()

    Internal Functions: are NOT meant to be called publicly
      - __declareNewSubform():  Only meant to be called by this.declareNewSubform()
      - __declareNewItem():     Only meant to be called by this.declareNewItem()
  */



  // This function navigates to the desired Form in the ConjureForm object and declares a new subform under it by calling this.__declareNewSubform()
  // -> this is the function that gets called externally by the user/client
  //
  // ARGS:
  // - formID:              the ID of the ConjureForm that you want to add a subform to
  //                        If this isn't the current ConjureForm, it will pass the function call to all subform children
  //
  // - prevOrderLocationID: the ID of the item/subform that this new subform should go after
  //                          if this argument is null, just append the new subform to the end of this.order
  //
  // RETURNS:
  // - the ID of the newly created/added ConjureForm
  declareNewSubform(formID = this.formID, prevOrderLocationID = null, insertPre = false) {
    if (formID === this.formID) {
      return this.__declareNewSubform(prevOrderLocationID, insertPre);
    }

    for (let key in this.subforms) {
      let newFormID = this.subforms[key].declareNewSubform(formID, prevOrderLocationID, insertPre);
      if (newFormID) {
        return newFormID;
      }
    }

    return false;
  }

  // This function navigates to the desired Form in the ConjureForm object and declares a new ConjureFormItem under it by calling this.__declareNewItem()
  // -> this is the function that gets called externally by the user/client
  //
  // ARGS:
  // - formID:              the ID of the ConjureForm that you want to add a ConjureFormItem to
  //                        If this isn't the current ConjureForm, it will pass the function call to all subform children
  //
  // - prevOrderLocationID: the ID of the item/subform that this new ConjureFormItem should go after
  //                          if this argument is null, just append the new ConjureFormItem to the end of this.order
  //
  // RETURNS:
  // - the ID of the newly created/added ConjureFormItem
  declareNewItem(formID = this.formID, newItemType = "text", prevOrderLocationID = null, insertPre = false) {


    if (formID === this.formID) {
      return this.__declareNewItem(newItemType, prevOrderLocationID, insertPre);
    }

    for (let key in this.subforms) {
      let newFormID = this.subforms[key].declareNewItem(formID, newItemType, prevOrderLocationID, insertPre);
      if (newFormID) {
        return newFormID;
      }
    }

    return false;
  }


  // adds an (empty) new ConjureFormItem to this.items
  // Args:
  // - prevOrderLocationID:   the ID of the item/subform that this new FormItem should come after
  //                          if this argument is null, just append the new FormItem to the end of this.order
  // Returns:
  //  - the newly created/added ConjureFormItem object
  __declareNewItem(newItemType, prevOrderLocationID, insertPre) {

    let newID = this.getNewUniqueID();
    let newItem = new ConjureFormItem(newID, newItemType);

    // add to this.subforms
    this.items[newID] = newItem;

    // add to this.order
    let orderItem = {"type": "ConjureFormItem", "id": newID};

    if (prevOrderLocationID === null) {
      this.order.push(orderItem);
    } else {

      // find the index of the prevOrderLocationID
      let pushIndex = -1;
      for (let i = 0; i < this.order.length; i++) {
        if (prevOrderLocationID === this.order[i]["id"]) {
          if (insertPre) {
            pushIndex = i;
          } else {
            pushIndex = i + 1;
          }
        }
      }

      // add the subform here
      if (pushIndex < 0) {
        this.order.push(orderItem);
      } else {
        this.order.splice(pushIndex, 0, orderItem);
      }
    }

    return newID;
  }


  // instantiates an (empty) new ConjureForm and adds it to this.subforms
  // -> this function is called internally by this.declareNewSubform() and should not be used otherwise
  //
  // Args:
  // - prevOrderLocationID:   the ID of the item/subform that this new subform should go after
  //                          if this argument is null, just append the new subform to the end of this.order
  // Returns:
  // - the newly created/added ConjureForm object
  __declareNewSubform(prevOrderLocationID = null, insertPre) {

    let newID = this.getNewUniqueID();
    let subformType = this.getSubformType();
    let newForm = new ConjureForm(newID, subformType);

    // add to this.subforms
    this.subforms[newID] = newForm;

    // add to this.order
    let orderItem = {"type": "ConjureForm", "id": newID};

    if (prevOrderLocationID === null) {
      this.order.push(orderItem);
    } else {

      // find the index of the prevOrderLocationID
      let pushIndex = -1;
      for (let i = 0; i < this.order.length; i++) {
        if (prevOrderLocationID === this.order[i]["id"]) {
          if (insertPre) {
            pushIndex = i;
          } else {
            pushIndex = i + 1;
          }
        }
      }

      // add the subform here
      if (pushIndex < 0) {
        this.order.push(orderItem);
      } else {
        this.order.splice(pushIndex, 0, orderItem);
      }
    }

    return newID;
  }


  // gets the proper form type for a child of this form
  getSubformType() {
    if (this.formDetails.containerType === "all") {
      return "page";
    } else if (this.formDetails.containerType === "page") {
      return "card";
    } else if (this.formDetails.containerType === "card") {
      return "subcard";
    } else if (this.formDetails.containerType === "subcard") {
      return "";
    }
  }

  // Delete --------------------------------------------------------------------
  /*
    Functions for deleting objects from the nested ConjureForm object
  */


  // when a user wants to delete a ConjureForm or ConjureFormItem, they call this function
  // needs to delete the targetID and clean up any dangling references that may have been caused
  delete(targetID) {
    this.__delete(targetID);
    this.__deleteConditionalReferences(targetID);
  }


  // finds the ConjureForm or ConjureFormItem with targetID and deletes it
  // - need to delete from this.subforms / this.items AND this.order
  __delete(targetID) {

    // this function removes an item with deletedID from the order
    // works by creating a copy of old order and omitting the deletedID
    let getNewOrder = function(deletedID, oldOrder) {
      let newOrder = [];
      for (let i = 0; i < oldOrder.length; i++) {
        if (oldOrder[i]["id"] !== deletedID) {
          newOrder.push(oldOrder[i]);
        }
      }
      return newOrder;
    }


    for (let key in this.subforms) {
      if (key === targetID) {
        delete(this.subforms[key]);
        this.order = getNewOrder(targetID, this.order)
        return;
      } else {
        this.subforms[key].__delete(targetID);
      }
    }

    for (let key in this.items) {
      if (key === targetID) {
        delete(this.items[key]);
        this.order = getNewOrder(targetID, this.order);
        return;
      }
    }
  }


  // used to delete conditional references to certain IDs.
  // useful for cleaning up dangling references when a user deletes a question
  __deleteConditionalReferences(deletedID) {
    if (this.formDetails.renderCondition.questionID === deletedID) {
      this.formDetails.renderConditionally = false;
      this.formDetails.renderCondition.questionID = false;
      this.formDetails.renderCondition.questionValue = false;
    }

    for (let key in this.subforms) {
      this.subforms[key].__deleteConditionalReferences(deletedID);
    }

    for (let key in this.items) {
      this.items[key].__deleteConditionalReferences(deletedID);
    }
  }

  // Get -----------------------------------------------------------------------
  /*
    Functions for retrieving info from (nested) ConjureForms / ConjureFormItems
  */


  // searches for object (either ConjureForm or ConjureFormItem) nested in this object with targetID
  get(targetID) {
    if (this.formID === targetID) {
      return this;
    }

    // check for target in subforms
    for (let key in this.subforms) {
      if (key === targetID) {
        return this.subforms[key]; // we've found the desired ConjureForm, return it
      } else {
        let result = this.subforms[key].get(targetID); // otherwise, see if this ConjureForm's children has it
        if (result !== false) {
          return result;
        }
      }
    }

    // check for target in items
    for (let key in this.items) {
      if (key === targetID) {
        return this.items[key]; // we found the item
      }
    }

    return false;
  }

  // Update --------------------------------------------------------------------
  /*
    Functions for updating details about the contents of the ConjureForm object
      - updateFormDetails(): updates form details
  */


  // sets this.formDetails.containerType in the right container
  // - newType:     the new type
  // - formID:      unique ID of the form that is being updated (defaults to the current form if no ID given)
  setContainerType(newType, formID = this.formID) {

    // if the current ConjureForm is the one we are looking for, make the change
    if (formID === this.formID) {
      if (__containerTypes.indexOf(newType) >= 0) {
        this.formDetails["containerType"] = newType;
      }

      // otherwise, look at the children to try to find the right ConjureForm
    } else {

      for (let key in this.subforms) {
        this.subforms[key].setContainerType(newType, formID);
      }
    }
  }


  // searches ConjureForm tree for the right ConjureForm(item) and updates its details
  // - if ConjureForm: update this.formDetails
  // - if ConjureFormItem: call updateItemDetails()
  // newDetails is a dict {}
  updateSectionDetails(sectionID, newDetails) {

    // if this ConjureForm is the one we are looking for, update this.formDetails
    if (sectionID === this.formID) {

      // overwrite the values specified in newDetails (and preserve untouched ones)
      for (let key in newDetails) {
        this.formDetails[key] = newDetails[key];
      }
      return true;
    }

    // check to see if desired section is a ConjureFormItem child of this ConjureForm
    for (let key in this.items) {
      if (key === sectionID) {
        this.items[key].updateItemDetails(newDetails);
        return true;
      }
    }

    // otherwise, check subforms for section to update
    for (let key in this.subforms) {
      if (this.subforms[key].updateSectionDetails(sectionID, newDetails)) {
        return true;
      }
    }

  }


  // similar to this.updateSectionDetails(), but does it for this.appearances instead of this.formDetails
  updateSectionAppearances(sectionID, newAppearances) {

    if (sectionID === this.formID) {
      for (let key in newAppearances) {
        this.appearance[key] = newAppearances[key];
      }
      return true;
    }

    for (let key in this.items) {
      if (key === sectionID) {
        this.items[key].updateItemAppearances(newAppearances);
        return true;
      }
    }

    for (let key in this.subforms) {
      if (this.subforms[key].updateSectionAppearances(sectionID, newAppearances)) {
        return true;
      }
    }
  }


  // pass in a ConjureFormItem or ConjureForm object, and this function will replace the existing version of it in the ConjureTree
  updateWholeSection(updatedSectionID, updatedSection) {

    for (let key in this.subforms) {
      if (updatedSectionID === key) {
        this.subforms[key] = updatedSection;
      } else {
        this.subforms[key].updateWholeSection(updatedSectionID, updatedSection);
      }
    }

    for (let key in this.items) {
      if (updatedSectionID === key) {
        this.items[key] = updatedSection;
      }
    }
  }



  // Form Output ---------------------------------------------------------------
  /*
    Functions for converting a ConjureForm tree into a JS object with the end output of a form
  */


  getFormOutputObject() {
    let formOutputObject = this.__getOutput();
    let formDetailsLookupTable = this.__getFormDetailsLookupTable();
    let formOutput =  new ConjureFormOutput(formOutputObject, formDetailsLookupTable);

    return formOutput;
  }



  // creates a lookup table {formID/itemID: form/itemDetails}
  __getFormDetailsLookupTable(conversions = {}) {

    let formDetails = this.formDetails;
    formDetails['type'] = "ConjureForm";
    conversions[this.formID] = formDetails;

    for (let key in this.subforms) {
      conversions = this.subforms[key].__getFormDetailsLookupTable(conversions);
    }

    for (let key in this.items) {
      let itemDetails = this.items[key].getItemDetails();
      itemDetails['type'] = "ConjureFormItem";
      conversions[key] = this.items[key].getItemDetails();
    }
    return conversions;
  }



  // builds up variables
  // - outputObject:    the default output object of a ConjureForm, nested from ConjureForm -> ConjureFormItem
  //                    If a ConjureForm is an array (formDetails.maxForms > 1), then place it inside an array
  __getOutput(outputObject = {}) {

    // only return branches of ConjureForm tree that actually have output objects
    let validOutputObjectFound = false;

    // add items to output
    for (let key in this.items) {
      let defaultOutput = this.items[key].getDefaultOutputObject();
      if (defaultOutput !== false) {
        validOutputObjectFound = true;
        outputObject[key] = this.items[key].getDefaultOutputObject();
      }
    }

    // recurse over subforms
    for (let key in this.subforms) {

      // if a subform has maxForms > 1, then it is represented in output as an array instead of a dict
      // -> outputObject[key] is an array, and the recursive outputObject that would normally go here is placed into formArrayTable[key]
      if (this.subforms[key].formDetails.maxForms > 1) {

        let childResult = this.subforms[key].__getOutput();
        if (childResult) {
          outputObject[key] = [childResult];
          validOutputObjectFound = true;
        }


      } else if (this.subforms[key].formDetails.maxForms == 1) {

        // if a subform has maxForms = 1, then it is represented in output as a dict
        // therefore, we can just add the recursive outputObject to outputObject
        let childResult = this.subforms[key].__getOutput();
        if (childResult !== false) {
          validOutputObjectFound = true;
          outputObject[key] = childResult;
        }
      }
    }

    if (validOutputObjectFound) {
      return outputObject;
    } else {
      return false;
    }
  }

  // Pages ---------------------------------------------------------------------

  // if this ConjureForm is of type all (and so its children are pages),
  // determines which page to render by adding to a lookup table
  addPagesToConditionalRenderLookup(renderLookup = {}, pageNum = 0) {
    if (this.formDetails.containerType === "all") {
      for (let i = 0; i < this.order.length; i++) {
        let pageID = this.order[i]['id'];
        if (i === pageNum) {
          renderLookup[pageID] = true;
        } else {
          renderLookup[pageID] = false;
        }
      }
      return renderLookup;
    } else {
      return false;
    }
  }

  // debug ---------------------------------------------------------------------
  /*
    Functions used for debugging
  */

  // prints out all questions in the ConjureForm
  __printQuestions() {
    for (let key in this.subforms) {
      this.subforms[key].printQuestions();
    }

    for (let key in this.items) {
      if (this.items[key].itemType === "question") {
        console.log(this.items[key]);
      }
    }
  }


  // Import --------------------------------------------------------------------
  /*
    Functions for loading saved conjureForm details into this ConjureForm
  */

  loadConjureForm(obj) {

    // iterate over all keys in the object to load ie: formID, subforms, items, colors, etc
    for (let key in obj) {

      // if this key corresponds to subforms, we want to create new ConjureForms for each subform in the array
      if (key === "subforms") {
        this.subforms = {};
        for (let subformKey in obj[key]) {
          let subform = new ConjureForm();
          subform.loadConjureForm(obj[key][subformKey]);
          this.subforms[subformKey] = subform;
        }

      // similarly, if this key corresponds to items, we want to create a new ConjureFormItem for each
      } else if (key === "items") {
        this.items = {};
        for (let itemKey in obj[key]) {
          let item = new ConjureFormItem();
          item.loadConjureFormItem(obj[key][itemKey]);
          this.items[itemKey] = item;
        }

      // otherwise, this key doesn't have a nested value so we can just copy it over directly
      } else {
        this[key] = obj[key];
      }
    }
  }

  // Export --------------------------------------------------------------------
  /*
    Functions for converting the class into other usable formats
     - JSON
     - render
  */


  export() {
    return (JSON.stringify(this, null, 2));
  }


  // renders <ConjureFormComponent/>
  // arguments are runtime values / functions that make it work in production
  render(
    formOutput = {},
    onClick_selectForm = () => {},
    devModeOn = false,
    selectedID,
    onInput_answerFormQuestion = () => {},
    onClick_answerMultipleChoiceQuestion = () => {},
    onClick_addNewSubformToArray = () => {},
    idConversionTable = {},
    indexInArray = -1,
    onClick_removeSubformFromArray = () => {},
    conditionalRenderLookup = {},
    onClick_moveToPage = () => {}
  )
  {

    return (
      <ConjureFormComponent
        subforms={this.subforms}
        items={this.items}
        order={this.order}
        formDetails={this.formDetails}
        appearance={this.appearance}
        containerType={this.formDetails.containerType}
        formID={this.formID}
        devModeOn={devModeOn}
        selectedID={selectedID}
        formOutput={formOutput}
        conditionalRenderLookup={conditionalRenderLookup}
        indexInArray={indexInArray}
        idConversionTable={idConversionTable}
        onClick_selectForm={onClick_selectForm}
        onInput_answerFormQuestion={onInput_answerFormQuestion}
        onClick_answerMultipleChoiceQuestion={onClick_answerMultipleChoiceQuestion}
        onClick_addNewSubformToArray={onClick_addNewSubformToArray}
        onClick_removeSubformFromArray={onClick_removeSubformFromArray}
        onClick_moveToPage={onClick_moveToPage}
      />
    );
  }
}

export default ConjureForm;
