import { Client } from '@elastic/elasticsearch';
import { ElasticSearchUtils } from '../src/ElasticSearchUtils';


const client = new Client({
    node: 'http://localhost:9200'
});

const elasticSearchUtils = new ElasticSearchUtils(client)
const INDEX = 'snp_financials'

describe('elasticsearch tests', () => {

    it('should return error index_not_found_exception', async () => {
        const query = {
            "bool": {
                "must": [{
                    "match_all": {}
                }]
            }
        }

        try {
            const result = await elasticSearchUtils.search(INDEX, query);
        } catch (error) {
            console.log('w', error);
            expect(error).toHaveProperty('statusCode', 404);
        }
    })

    it('should create a new elasticsearch index', async () => {

        const result = await elasticSearchUtils.createIndex(INDEX);
        console.log('result ', result);

    })

    it('should add or update a new recod', async () => {
        const data = { "name": "test" }
        const result = await elasticSearchUtils.addOrupdate(INDEX, null, JSON.stringify(data));
        console.log('result ', result);

    })

    it('should search elasticsearch', async () => {
        const query = {
            "bool": {
                "must": [{
                    "match_all": {}
                }]
            }
        }
        const result = await elasticSearchUtils.search(INDEX, query);
        console.log(JSON.stringify(result, null, 2));

    })



})