import { ApiResponse, Client, RequestParams } from '@elastic/elasticsearch'

import moment = require("moment")
const esb = require('elastic-builder');

/*

* @author Jayakumar Jayaraman
*/
export class ElasticsearchUtils {

    // Takes the ES client as argument
    constructor(private client: Client) { }

    /*
    * Search multiple indexes and find that many records (as given in QueryModel size parameter)
    *
    * @param esIndexPrefix - the ES index prefix  format eg. logstash_audit-video_us-east-develop.oncamdev.com (without suffix _2022.06)
    * @param queryModel - the query model which holds all data to build the ES query
    * @return Promise<ApiResponse> - the full search results 
    * 
    */
    search = async (esIndexPrefix: string, queryModel: QueryModel): Promise<any> => {

        const { startDate, endDate, size } = queryModel
        const expectedDataSize = size || 200
        const esSuffixes = generateEsIndexSuffixes(startDate, endDate)
        let fullData: Array<object> = [];
        let totalNumFetched = 0
        for (let esSuffix of esSuffixes) {

            const esIndex = esIndexPrefix + esSuffix

            // Query the Elasticsearch to get the data
            let result: ApiResponse = await this.searchOneIndex(esIndex, queryModel)

            if (result?.body) {
                const currentDataSize = result.body.hits?.hits?.length
                console.debug(`Search on index: ${esIndex} returned results of size: ${currentDataSize}`)
                if (currentDataSize > 0) {
                    const currentData = result.body.hits?.hits?.map((e: { _source: any; }) => e._source)
                    totalNumFetched += currentDataSize // Adds to total data count
                    fullData = fullData.concat(currentData) // Adds all the result to array

                    if (totalNumFetched >= expectedDataSize) {
                        console.debug(`Search on all index completed requested data size: ${size}, and totalNumFetched: ${totalNumFetched}`)
                        return fullData.slice(0, expectedDataSize + 1)
                    }
                }
            } else {
                console.warn(`No search results found on index: ${esIndex}`)
            }

        }
        console.warn(`No indexes found for the given startDate: ${startDate} and endDate: ${endDate}`)
        return fullData
    }

    /*
    * Search a single index with query model data
    *
    * @param index - the ES index to search. In full format eg. logstash_audit-video_us-east-develop.oncamdev.com_2022.06
    * @param queryModel - the query model which holds all data to build the ES query
    * @return Promise<ApiResponse> - the full search results 
    * 
    */
    searchOneIndex = async (index: string, model: QueryModel): Promise<ApiResponse> => {

        console.debug(`Inputs -> index: ${index}, query model: ${JSON.stringify(model)} `);
        const { query, sort, size } = buildQuery(model);
        let result: any
        try {

            await this.client.indices.refresh({ index })

            const searchParams: RequestParams.Search = {
                index,
                body: {
                    query
                },
                _source: ['@timestamp'],
                sort: JSON.stringify([{ "@timestamp": { "order": "DESC" } }]), // This needs to be a string
                size
            }
            console.log(`searchParams generated for the ES SDK search call is : ${JSON.stringify(searchParams)}`)
            result = await this.client.search(searchParams)
        } catch (error) {
            let errorString = JSON.stringify(error)
            if (errorString.includes('index_not_found_exception')) {
                errorString = `Index ${index} not found`
            }
            console.warn(`${errorString}`);
        }
        return result
    }
}



// Build the elasticsearch query dynamically based on the input Query model data
// And return as JSON string which contains ES query, sort and size data
// Reference: https://elastic-builder.js.org/docs/
export const buildQuery = (model: QueryModel) => {

    const { startDate, endDate, matchMap, notMatchMap, size } = model

    const query = esb.boolQuery()

    // Filters
    // must query      
    if (matchMap) {
        Object.entries(matchMap).forEach(([key, value]) => {
            query.filter(esb.termQuery(`${key}.keyword`, value))
        })
    }

    // must not query
    if (notMatchMap) {
        Object.entries(notMatchMap).forEach(([key, value]) => {
            query.mustNot(esb.termQuery(`${key}.keyword`, value))
        })
    }

    // Range query
    query.filter(esb.rangeQuery('@timestamp').gte(startDate).lte(endDate))


    // Adds query to the output
    let requestBody = esb.requestBodySearch().query(query)

    // sort
    requestBody.sort(esb.sort('@timestamp', 'desc'))

    // size
    if (size) {
        requestBody.size(size)
    }
    console.debug(`Generated ES Query is: ${JSON.stringify(requestBody)}`);

    return requestBody.toJSON()
}



// Find the number of months between the two given dates, including the start and end months.
export const findNumberOfMonths = (startDate: string, endDate: string): number => {

    if (startDate && !moment(startDate).isValid()) {
        throw new Error(`Invalid startDate: ${startDate}`)
    }

    if (endDate && !moment(endDate).isValid()) {
        throw new Error(`Invalid endDate: ${endDate}`)
    }

    const start = moment(startDate).startOf('month')
    const end = moment(endDate).endOf('month')

    const months = Math.round(Math.abs(start.diff(end, 'months', true)))
    console.debug(`Number of months between ${startDate} and ${endDate} is : ${months}`)
    return months
}


// Generate multiple monthy ES index suffix for the given date in descending order and return and array in format YYYY.MM   
// eg. ['2022.06', '2022.05', '2022.04']
export const generateEsIndexSuffixes = (startDate: string, endDate: string): Array<string> => {

    let esIndexSufixes: Array<string> = []
    const numberOfMOnths = findNumberOfMonths(startDate, endDate)
    let date = endDate
    for (let i = 0; i < numberOfMOnths; i++) {
        let sufix = generateEsIndexSuffixWithDate(moment(date).subtract(i, 'month').format())
        esIndexSufixes.push(sufix)

    }
    return esIndexSufixes
}

// Generates a single month ES index suffix for the given date and return in format YYYY.MM   eg. '2022.06'
export const generateEsIndexSuffixWithDate = (date: string) => {
    if (date && !moment(date).isValid()) {
        throw new Error(`Invalid date: ${date}`)
    }
    return `${moment(date).format('YYYY')}.${moment(date).format('MM')}`
}


// Model
export interface QueryModel {
    companyId?: string,
    startDate: string,
    endDate: string,
    matchMap?: object,
    notMatchMap?: object,
    size?: number,
    cacheId?: string
}