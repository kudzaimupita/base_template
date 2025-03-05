const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to get all project files
function getAllFiles(directory) {
  return new Promise((resolve, reject) => {
    // Get files from views directory only
    glob(
      'src/views/**/*.{js,jsx,ts,tsx}',
      {
        ignore: ['node_modules/**', 'dist/**', 'build/**'],
        cwd: directory,
      },
      (err, viewFiles) => {
        if (err) reject(err);

        // Get all source files to check for references
        glob(
          'src/**/*.{js,jsx,ts,tsx}',
          {
            ignore: ['node_modules/**', 'dist/**', 'build/**'],
            cwd: directory,
          },
          (err, allFiles) => {
            if (err) reject(err);
            resolve({ viewFiles, allFiles });
          }
        );
      }
    );
  });
}

// Function to check if a file is imported anywhere
function isFileReferenced(filePath, allFiles, baseDir) {
  const fileContent = allFiles
    .map((file) => {
      try {
        return fs.readFileSync(path.join(baseDir, file), 'utf8');
      } catch (err) {
        return '';
      }
    })
    .join('\n');

  const fileName = path.basename(filePath, path.extname(filePath));
  return fileContent.includes(fileName);
}

// Main function to find unused files
async function findUnusedFiles(directory) {
  const { viewFiles, allFiles } = await getAllFiles(directory);
  const unused = [];

  for (const file of viewFiles) {
    if (
      !isFileReferenced(
        file,
        allFiles.filter((f) => f !== file),
        directory
      )
    ) {
      unused.push(file);
    }
  }

  unused.forEach((file) => '');

  // Optional: automatically delete unused files
  if (unused.length > 0) {
    if (process.argv.includes('--delete')) {
      unused.forEach((file) => {
        try {
          fs.unlinkSync(path.join(directory, file));
        } catch (err) {
          console.error(`Error deleting ${file}:`, err);
        }
      });
    }
  }
}

// Run the script
findUnusedFiles(process.cwd());
