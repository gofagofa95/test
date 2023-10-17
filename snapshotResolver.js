let path;
let nameFile;

path = `/__snapshots__${global.SNAPSHOT}__`

module.exports = {
    // resolves from test to snapshot path
    resolveSnapshotPath: (testPath, snapshotExtension) =>
    (nameFile = testPath.match(/\/([^\/]+)$|\\([^\\]+)$/gm),
        testPath.replace(nameFile, path) + (nameFile + snapshotExtension)),


    // resolves from snapshot to test path
    resolveTestPath: (snapshotFilePath, snapshotExtension) => (
        snapshotFilePath
            .replace(path, '')
            .slice(0, -snapshotExtension.length)
            ),

    // Example test path, used for preflight consistency check of the implementation above
    testPathForConsistencyCheck: `__tests__/WEB/CRM/DaftarSekenario/__snapshots__/getAllUnitFromMarketing.js`,

};

