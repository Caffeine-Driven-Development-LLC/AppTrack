# App Track

I need a better way of tracking what applications I send out, I don't like the idea of applying to the same company
to many times in a short period of time. I also like to know if I could expect a letter of rejection or not. Plus
I'm sure there are many other insights I could gain by better tracking this data.

So this project will have a simple goal, track the applications I send out and store the data in a database for further
investigation.

## Build

This project is a desktop app powered by electron js. I am using React for the ui and Sqlite for the database.

All code is written as ECMA script modules. Electron, however, runs in a node environment which requires commonJS.
The `build` script will transpile the code to commonJS and then use webpack to bundle the files into a set of files
electron can understand, these files are placed in the `.webpack` directory.

So I have a few different scripts defined in my `package.json` file to help with the build process.
 - clean: removes the `.webpack` directory
 - build: runs the clean script and then transpiles the code and bundles it into the `.webpack` directory
 - start: runs the build script and then starts the electron app
 - watch: watches the render directory for changes, and rebuilds the app when changes are detected
 - test: executes mocha unit tests

## Version History

### 0.1.0
 - Initial Development release

### 0.2.0
 - The application feature complete
   - Company tracking,
   - Application tracking,
   - Application state tracking
   - Stats page

## Using this app

This app right now tracks companies and applications, and the applications state.

Currently, you need to add the company to the companies list, then you can add an application for that company in the
application list.

The flow of states for the application, is set in the database, and in time should be configurable to any user's preference.
but for the time being it has a basic set of states.

## TODO for initial release
 - Unit tests!
 - Fix up stats page
  - Currently any application who's most recent event shows up in the stat page when searching by date, this should be refined so it shows events in that range.
  - It would be nice to click on a element in the sankey chart and be taken to a applicaion list of thoes applications.
 - A website to describe the application with a download link.
 - Create Installer
   - Create a company
     - Create an Apple developer account
     - Create a windows developer account
     - Create a linux developer account
   - Updater

## Nice to haves
 - Add helper modals when first viewing a page
 - Tool tips on all the things
 - Rework company page so there is an easier time switching companies when looking at company details
 - Find a quicker way to open up all stared companies career pages

## Future releases
 - Resume Tracking
   - Custom resume tailoring to job descriptions.
 - Link to browser plugin
