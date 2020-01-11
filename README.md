# Conjure Forms
#### More Flexible Google Forms for React.js
Use Conjure Forms to add easy, flexible, and beautiful surveys to your React.js project. Conjure Forms are highly customizable and support features like conditional question rendering and arrays of questions. When a user is done filling out the form, you can grab their answers as a well defined JSON object.  

## How To Use
#### 1. Install The NPM Package
 1. Run `npm install conjure-form` to install the component to your project.

#### 2. Import Conjure Form Into Your Component
Add the following import statements at the top of your React Component.
 1. `import ConjureFormController from 'conjure-form';`
 2. `import conjure-form/build/main.css;`

#### 3. Generate The Conjure Form You Want To Use
 1. Go to the [Conjure Form Maker](http://conjure.netlify.com) and create a form.
 2. Save that form to a JSON file in your React project.
 3. Import that file into your component, ie: `import __formJSON from './form.json';`

#### 4. Initialize The Conjure Form In Your Component
In your component's constructor, add the following code:
 1. `let rerender = function() { this.forceUpdate() }.bind(this);`
 2. `let form = new ConjureFormController(__formJSON, rerender);`
 3. `this.state = { conjureForm: form };`

This will load your form from JSON into the ConjureForm class. It is now ready to render / be used.

Note: *You need to pass a rerender function into the ConjureForm's constructor so that it can trigger a rerender from React when a user inputs data into the form. This is because ConjureFormController is not a React component, so changes within it will not be rerendered automatically.*

#### 5. Render The Conjure Form
In your Component's render function's JSX, add the following code:
 1. `<div>{this.state.conjureForm.renderForm()}</div>`

This will render the ConjureForm and fill 100% of the height / width of the div the form is in. The user will be able to fill out the form now.

#### 6. Grab The Form Results
 1. Inside the component, call `this.state.conjureForm.getFormResults();` to return the current output of the form with user inputted answers. This will be a JS object with the same structure as when you followed step 3 to generate the ConjureForm.


## ConjureFormController Functions

| Function | Explanation |
| -------- | ----------- |
| `new ConjureFormController(formJSON, rerenderFunction)` | Constructor for ConjureFormController, loads the Conjure Form specified in formJSON. rerenderFunction is a function you have to pass to the class from your component so it can force a React rerender when the user interacts with the Conjure Form. |
| `.loadForm(formJSON)` | Loads a form from the JSON blueprint. Use this function to switch active forms or pass in the blueprint for the currently active form to reset state |
| `.renderForm()` | renders the form |
| `.renderFormResults()` | renders the JSON object of the user's answers to the form. This is typically used for development purposes. |
|`.getFormResults(bool filterByRender)` | returns a JS object of the form results. If filterByRender is true, the result object will only have answers to questions that were rendered (so conditionally rendered subforms that weren't rendered will be missing)|
