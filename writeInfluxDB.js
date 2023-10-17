const { InfluxDB } = require('@influxdata/influxdb-client')
const { Point } = require('@influxdata/influxdb-client')
const _ = require('lodash');
require('dotenv').config();
const fs = require('fs');
let rawDataAT = fs.readFileSync('./jest-stare/jest-results.json');

const resultAT = JSON.parse(rawDataAT);

const paramEnv = process.argv.slice(2);

// Set up connection information
const token = process.env.INFLUX_TOKEN;
const influxOrg = process.env.INFLUX_ORG;
const influxBucket = process.env.INFLUX_BUCKET;

// Create InfluxDB client instance
const influxDBClient = new InfluxDB({ url: process.env.INFLUX_URL, token: token })

const timestamp = new Date();

// Write JSON data to InfluxDB using Flux
const writeArrayJSONToInfluxDB = async (jsonArray) => {
  const writeApi = influxDBClient.getWriteApi(influxOrg, influxBucket)

  for (const json of jsonArray) {
    const point = new Point(json.measurement)
      .tag('tag', json.tags)
      .floatField(json.field, json.value)
      .timestamp(timestamp)
    writeApi.writePoint(point)
  }

  await writeApi.close()
}

// Example usage
const jsonArraySummary = [
  { measurement: `summary-${paramEnv}`, field: 'totalTC', value: resultAT.numTotalTests },
  { measurement: `summary-${paramEnv}`, field: 'failed', value: resultAT.numFailedTests },
  { measurement: `summary-${paramEnv}`, field: 'passed', value: resultAT.numPassedTests },
  { measurement: `summary-${paramEnv}`, field: 'skipped', value: resultAT.numPendingTests },
]

let listResultSTE = [];
let uniqueListSTE = [];
resultAT.testResults.map(elem1 => {
  elem1.testResults.map(elem2 => {
    elem2.title = elem2.title.split(' ')[1]
    if (elem2.title !== undefined && !elem2.title.includes(process.env.INFLUX_TAG_TCM) && elem2.title.includes('@')) {
      listResultSTE.push(_.pick(elem2, ['title', 'status']));
      uniqueListSTE.push(elem2.title);
    }
  })
})

uniqueListSTE = [...new Set(uniqueListSTE)]

let summarySTE = [];

uniqueListSTE.map(ste => {
  let objSTE = {};
  const countAll = listResultSTE.reduce((acc, obj) => {
    if (obj.title.includes(ste)) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const countPassed = listResultSTE.reduce((acc, obj) => {
    if (obj.title.includes(ste) && obj.status == 'passed') {
      return acc + 1;
    }
    return acc;
  }, 0);

  const countFailed = listResultSTE.reduce((acc, obj) => {
    if (obj.title.includes(ste) && obj.status == 'failed') {
      return acc + 1;
    }
    return acc;
  }, 0);

  const countSkipped = listResultSTE.reduce((acc, obj) => {
    if (obj.title.includes(ste) && obj.status == 'pending') {
      return acc + 1;
    }
    return acc;
  }, 0);

  objSTE['uid'] = ste;
  objSTE['totalTC'] = countAll;
  objSTE['passed'] = countPassed;
  objSTE['failed'] = countFailed;
  objSTE['skipped'] = countSkipped;

  summarySTE.push({ measurement: `summarySTE-${paramEnv}`, tags: ste, field: 'totalTC', value: countAll });
  summarySTE.push({ measurement: `summarySTE-${paramEnv}`, tags: ste, field: 'passed', value: countPassed });
  summarySTE.push({ measurement: `summarySTE-${paramEnv}`, tags: ste, field: 'failed', value: countFailed });
  summarySTE.push({ measurement: `summarySTE-${paramEnv}`, tags: ste, field: 'skipped', value: countSkipped });
})

writeArrayJSONToInfluxDB(jsonArraySummary)
  .then(() => console.log('JSON Summary data written to InfluxDB!'))
  .catch(error => console.error(error))

writeArrayJSONToInfluxDB(summarySTE)
  .then(() => console.log('JSON Detail data written to InfluxDB!'))
  .catch(error => console.error(error))
