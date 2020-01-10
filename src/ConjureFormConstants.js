const __defaultQuestionInputDetails = {
  "questionTitle": "Question Title",
  "questionDescription": "Description",
  "questionType": "input",
  "inputType": "string",
  "inputPrompt": "prompt...",
  "defaultValue": ""
};

const __defaultQuestionMultipleChoiceDetails = {
  "questionTitle": "Question Title",
  "questionDescription": "Description",
  "questionType": "multipleChoice",
  "multipleChoiceType": "standard",
  "minSelected": 0,
  "maxSelected": 1,
  "choices": []
};

class ConjureFormConstants {
  getDefaultQuestionInputDetails() {
    return __defaultQuestionInputDetails;
  }
}

export default ConjureFormConstants;
