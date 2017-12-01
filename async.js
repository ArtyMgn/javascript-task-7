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
            numberOfFinishedJobs++;
            jobsResult[jobIndex] = jobResult;

            if (jobs.length === numberOfFinishedJobs) {
                resolve(jobsResult);
            } else if (jobsPromises.length !== 0) {
                startJob(jobsPromises.shift());
            }
        }

        function startJob(job) {
            let indexOfJob = jobsCounter++;
            let jobCompletionHandler = result => completeJob(result, indexOfJob);
            job().then(jobCompletionHandler)
                .catch(jobCompletionHandler);
        }

        jobsPromises = createPromisesWithTimeout(jobs, timeout);
        jobsPromises.splice(0, parallelNum).forEach(startJob);
    });
}

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Array}
 */
function createPromisesWithTimeout(jobs, timeout) {
    return jobs.map(job => {
        let timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => reject('Promise timeout'), timeout);
        });

        return () => Promise.race([job(), timeoutPromise]);
    });
}
