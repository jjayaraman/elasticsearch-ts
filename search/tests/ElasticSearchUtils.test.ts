import { Client } from '@elastic/elasticsearch';
import { ElasticSearchUtils } from '../src/ElasticSearchUtils';


const client = new Client({
    node: 'http://localhost:9200'
});

const elasticSearchUtils = new ElasticSearchUtils(client)

describe('elasticsearch tests', () => {


    it('should create a new elasticsearch record', async () => {
        await elasticSearchUtils.create('mytestindex', 'my first dataset');

    })

    it('should search elasticsearch', async () => {
        const index = 'car'
        const query = {
            "bool": {
                "must": [{
                    "match_all": {}
                }]
            }
        }
        const result = await elasticSearchUtils.search(index, query);
        console.log(JSON.stringify(result, null, 2));

    })



})