#Todos

- for all questions in the design system, the checkmark needs to be moved to the end of the question, not the left. Look at the image example_layout_questions to understand how the questions should look. only make changes to the layout, not the colors for this task
- For all questions - except large text area inputs - the answer (checkbox, date, number inout, etc.) should be inline with the question and appear at the end
- For all questions that are answered - and for text input boxes - we need a feature that displays a message underneath that shows the date and who made the update. We have a feature that partially does this, but it disappears after the session. this information needs to persist
- For all questions that have been previously enetered - but not text area inputs, we need a modal warning the user when they change the answer. the idea is that changing the answer will change the data of when and who updated something and we need a short message telling them to prevent accidental changing
- On the checklist and migration management page, the header is fine, but the main card below is too wide on latop. It should only take up a max width of 66%
- On the checklist page, there is a bug when clicking the "back" button. When clicking it, and then going back into the checklist page, i get the modal asking me if i want to save changes. This is unpected and needs to be investigated
- When all the questions in a section have been answered, the section heade should turn green and compact itself
On the checklist page, the "Communication assistance offered?" need to change to a "yes or no" question type and say "Would you like assistance with your communication strategy?"
- On the checklist page, change the wording of the question "Change Tool installed" to "TCM tool installed"
- On the checklist page, move the Tableau Server section up one section
- On teh checklist page, the question "Is there a time delay for client to review Runbook?" needs to be a  "yes or no" question type. 
- On the checklist page, change "Housekeeping complete" to "Server ready to migrate" 
- On the checklist page, there's a bug with Tableau Cloud edition and number of sites. I should get a modal warning when chosing a number of sites larger than what the edition allows for. This needs to be fixed
- On the checklist page, the question "Will the data sources be using Windows Auth?" nees to change to "yes no" type
- On the checklist page, the question, "Is Private Connect required?" - if yes, we need an additional question that asks "What is the pod for the instance with Private Connect?"
Add "General Notes" section