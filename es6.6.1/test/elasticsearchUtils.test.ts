import { buildQuery, ElasticsearchUtils, findNumberOfMonths, QueryModel } from './../src/elasticsearchUtils';
import { ApiResponse, Client, RequestParams } from '@elastic/elasticsearch'
import moment = require('moment');



describe('Test suite to test ESQueryBuilder functionnalities', () => {

    it('should be able to test against local ES', async () => {

        const client = new Client({
            node: 'http://localhost:9200'
        })

        const esUtils = new ElasticsearchUtils(client)

        const buildQueryModel = (): QueryModel => {
            const currentdate = moment().format('YYYY-MM-DD')
            const pastDate = moment().subtract(150, 'days').format('YYYY-MM-DD')

            const queryModel: QueryModel = {
                startDate: pastDate,
                endDate: currentdate,
                matchMap: {
                    'companyId': 'lessonvugw',
                },
                size: 100
            }

            return queryModel
        }

        // const result = await esUtils.search('logstash_audit-useraction_us-east-develop.oncamdev.com_', buildQueryModel())
        const result = await esUtils.searchOneIndex('logstash_audit-useraction_us-east-develop.oncamdev.com_2022.06', buildQueryModel())
        expect(result).toBeTruthy();
        const final = result.body.hits?.hits
        console.log(JSON.stringify(final, null, 2));
    })



})