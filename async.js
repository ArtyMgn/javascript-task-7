'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    let jobsResult = [];
    let jobsCounter = 0;
    let numberOfFinishedJobs = 0;
    let jobsPromises = [];

    return new Promise(resolve => {
        if (!jobs.length || parallelNum <= 0) {
            resolve(jobsResult);
        }

        function completeJob(jobResult, jobIndex) {
            jobsResult[jobIndex] = jobResult;

            if (jobs.length === numberOfFinishedJobs++) {
                resolve(jobsResult);
            } else {
                startNextJob();
            }
        }

        function startNextJob() {
            if (jobsPromises.length === 0) {
                return null;
            }

            let indexOfJob = jobsCounter++;
            let jobCompletionHandler = result => completeJob(result, indexOfJob);
            let currentJob = jobsPromises.shift();
            currentJob()
                .then(jobCompletionHandler)
                .catch(jobCompletionHandler);
        }

        jobsPromises = createPromisesWithTimeout(jobs, timeout);
        jobsPromises.slice(0, parallelNum).forEach(startNextJob);
    });
}

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Array}
 */
function createPromisesWithTimeout(jobs, timeout) {
    return jobs.map(job => () => new Promise((resolve, reject) => {
        job().then(resolve, reject);
        setTimeout(() => reject(new Error('Promise timeout')), timeout);
    }));
}
