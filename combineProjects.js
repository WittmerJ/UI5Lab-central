'use strict';

const optionDefinitions = [
	{ name: 'deploy', alias: 'd', type: Boolean } // determines deploy step to gh-pages without ui5 build tools
];

const commandLineArgs = require('command-line-args');
const fs = require('fs-extra');
const npmPackage = require('./package.json');
const newUI5LabBrowserPath = './webapp';
const newUI5LabBrowserResourcesPath = newUI5LabBrowserPath + '/resources';
const newUI5LabBrowserTestResourcesPath = newUI5LabBrowserPath + '/test-resources';

// config parameters
const oOptions = commandLineArgs(optionDefinitions);

/**************************
 * UI5 and browser:
 * Copy the browser project and all needed UI5 libraries from npm_modules to a local folder
 *************************/

console.log("Copying browser to: " + newUI5LabBrowserPath);

// copy browser
fs.copySync('./node_modules/ui5lab-browser/dist', newUI5LabBrowserPath); //new UI5Lab-browser with UI5 tooling
fs.copySync('./libraries.json', newUI5LabBrowserPath + '/libraries.json'); //new UI5Lab-browser with UI5 tooling


/**************************
 * UI5Lab projects:
 * Copy all loaded projects to the appropriate places (resources and test-resources)
 **************************/

console.log("Copying libraries");

for (let library in npmPackage.dependencies) {
	//Does not process @openui5 namespace or ui5lab-browser
	if (library.indexOf('@openui5') < 0 && library !== 'ui5lab-browser') {
		copyLibraryToUI5LabBrowser(library);
	}
}

/**************************
 * Deploy preparations:
 * Copy everything to be deployed in deploy folder
 **************************/

if (oOptions.deploy) {
	console.log("Copy files to deploy folder");

	// copy preview page by @nitishmeta to root folder
	fs.copySync('./homepage', './deploy');
	// copy docsify pages by @nlsltz to docs folder
	fs.copySync('./docs', './deploy/docs');
	// copy browser to subfolder browser for the moment
	fs.copySync('./webapp', './deploy/browser');
	// override development index with productive CDN bootstrap index
	fs.copySync('./index.html', './deploy/browser/index.html');
}

/*** helper functions ***/

function copyLibraryToUI5LabBrowser(library) {
	try {
		const libraryPath = './node_modules/' + library;
		//Does not copy libraries which have UI5 tooling because it will be loaded automatically by UI5 tooling
		// when deploying to gh_pages always copy libraries as we do not have ui5 tools there
		if (oOptions.deploy || !_hasUI5Tooling(libraryPath)) {
			_copyLibraryToResources(libraryPath);
			_copyLibraryToTestResources(libraryPath);
		}

	} catch(err) {
		console.log("An error occured post-processing library: " + library + err.message);
	}
}

function _copyLibraryToResources(libraryPath) {
	const copyFromPath = _getLibraryDistOrSrcPath(libraryPath);
	fs.copySync(copyFromPath, newUI5LabBrowserResourcesPath);
}

function _copyLibraryToTestResources(libraryPath) {
	const copyFromPath = _getLibraryTestPath(libraryPath);
	fs.copySync(copyFromPath, newUI5LabBrowserTestResourcesPath);
}

function _getLibraryDistOrSrcPath(libraryPath) {
	const distResources = libraryPath + '/dist/resources';
	const dist = libraryPath + '/dist';
	const src = libraryPath + '/src';
	let copyFromPath = null;
	if (fs.existsSync(distResources)) {
		copyFromPath = distResources;
	} else	if (fs.existsSync(dist)) {
		copyFromPath = dist;
	} else	if (fs.existsSync(src)) {
		copyFromPath = src;
	}
	return copyFromPath;
}

function _getLibraryTestPath(libraryPath) {
	const distTestResources = libraryPath + '/dist/test-resources';
	const test = libraryPath + '/test';
	let copyFromPath = null;
	if (fs.existsSync(distTestResources)) {
		copyFromPath = distTestResources;
	} else	if (fs.existsSync(test)) {
		copyFromPath = test;
	}
	return copyFromPath;
}

function _hasUI5Tooling(libraryPath) {
	return (fs.existsSync(libraryPath + '/ui5.yaml'));
}
