/**
 * Update Question Template with questionKey
 *
 * Adds semantic questionKey to all questions and converts
 * metadata.dependsOn from IDs to keys.
 */

const fs = require('fs');
const path = require('path');
const { questionKeyMapping } = require('../seeds/questionKeyMapping');

const templatePath = path.join(__dirname, '../seeds/questionTemplate.js');

// Read the current template
const templateContent = fs.readFileSync(templatePath, 'utf8');

// Function to add questionKey after id field
function addQuestionKeyToTemplate(content) {
  let updatedContent = content;

  // For each question ID in the mapping, add questionKey
  Object.entries(questionKeyMapping).forEach(([id, key]) => {
    // Match pattern: id: 'qX', followed by next field
    const idPattern = new RegExp(
      `(\\s+id:\\s+'${id}',)\\n(\\s+)([a-zA-Z]+:)`,
      'g'
    );

    updatedContent = updatedContent.replace(
      idPattern,
      (match, idLine, indent, nextField) => {
        return `${idLine}\n${indent}questionKey: '${key}',\n${indent}${nextField}`;
      }
    );
  });

  return updatedContent;
}

// Function to update dependsOn from IDs to keys
function updateDependencies(content) {
  let updatedContent = content;

  // Find all dependsOn: 'qX' patterns and replace with keys
  Object.entries(questionKeyMapping).forEach(([id, key]) => {
    const dependsOnPattern = new RegExp(
      `dependsOn:\\s+'${id}'`,
      'g'
    );

    updatedContent = updatedContent.replace(
      dependsOnPattern,
      `dependsOn: '${key}'`
    );
  });

  return updatedContent;
}

// Main execution
function main() {
  console.log('Updating question template with questionKey...\n');

  // Step 1: Add questionKey fields
  let updatedContent = addQuestionKeyToTemplate(templateContent);

  // Step 2: Update dependencies to use keys
  updatedContent = updateDependencies(updatedContent);

  // Step 3: Write back to file
  fs.writeFileSync(templatePath, updatedContent, 'utf8');

  // Step 4: Verify by counting questionKey occurrences
  const keyCount = (updatedContent.match(/questionKey:/g) || []).length;
  const expectedCount = Object.keys(questionKeyMapping).length;

  console.log(`✓ Added questionKey to ${keyCount}/${expectedCount} questions`);

  // Check for any remaining ID-based dependencies
  const remainingIdDeps = updatedContent.match(/dependsOn:\s+'q\d+'/g);
  if (remainingIdDeps) {
    console.warn(`⚠ Warning: Found ${remainingIdDeps.length} ID-based dependencies still present:`);
    remainingIdDeps.forEach(dep => console.warn(`  ${dep}`));
  } else {
    console.log('✓ All dependsOn references converted to keys');
  }

  console.log('\n✓ Template updated successfully!');
  console.log(`  File: ${templatePath}`);
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('Error updating template:', error.message);
    process.exit(1);
  }
}

module.exports = { addQuestionKeyToTemplate, updateDependencies };
